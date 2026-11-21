import math
import logging
from abc import ABC, abstractmethod
from typing import List, Tuple, Dict, Any, Optional
import requests

logger = logging.getLogger("gramroute.routing")

class BaseRoutingProvider(ABC):
    """
    Abstract routing provider for road distance and travel time matrices.
    Haversine is strictly for initial bounding/filtering, never for road cost calculation.
    """

    @staticmethod
    def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Great-circle distance in km. Used solely for rough spatial pre-filtering."""
        r = 6371.0 # Earth's radius in km
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)

        a = math.sin(delta_phi / 2.0) ** 2 + \
            math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        return round(r * c, 2)

    @abstractmethod
    def get_distance_and_duration_matrix(
        self, coordinates: List[Tuple[float, float]]
    ) -> Tuple[List[List[float]], List[List[float]]]:
        """
        Calculates NxN matrix for road distance in km and travel duration in minutes.
        coordinates: List of (latitude, longitude) tuples.
        Returns: (distance_matrix_km, duration_matrix_minutes)
        """
        pass


class FallbackRoadMatrixProvider(BaseRoutingProvider):
    """
    Calibrated rural road circuity and speed model for Indian highway & rural networks.
    Applies empirical circuity factor (1.32x - 1.38x) over Haversine and variable speed curves.
    Ensures deterministic, reliable optimization in offline environments without external dependencies.
    """

    def _calculate_road_distance_km(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        if lat1 == lat2 and lon1 == lon2:
            return 0.0
        
        aerial_km = self.haversine_km(lat1, lon1, lat2, lon2)
        
        # Empirical circuity factor for Indian rural/district roads:
        # Shorter distances have higher winding factors (village approaches ~1.38x)
        # Long inter-city highway corridors have lower circuity (~1.28x - 1.32x)
        if aerial_km < 20.0:
            circuity = 1.38
        elif aerial_km < 80.0:
            circuity = 1.34
        else:
            circuity = 1.30

        return round(aerial_km * circuity, 2)

    def _calculate_travel_duration_minutes(self, road_km: float) -> float:
        if road_km == 0.0:
            return 0.0
        
        # Commercial vehicle speed model in rural/semi-urban India:
        # Under 20 km: Village/mandi interior roads (~30 km/h)
        # 20 - 70 km: State highways & district roads (~45 km/h)
        # > 70 km: National expressways/NH corridor (~58 km/h)
        if road_km < 20.0:
            avg_speed_kmh = 30.0
        elif road_km < 70.0:
            avg_speed_kmh = 45.0
        else:
            avg_speed_kmh = 58.0

        driving_minutes = (road_km / avg_speed_kmh) * 60.0
        # Add transit buffer (toll plazas, railway crossings, traffic slowdowns: 3 mins per 25 km)
        buffer_minutes = math.ceil(road_km / 25.0) * 3.0
        return round(driving_minutes + buffer_minutes, 1)

    def get_distance_and_duration_matrix(
        self, coordinates: List[Tuple[float, float]]
    ) -> Tuple[List[List[float]], List[List[float]]]:
        n = len(coordinates)
        distance_matrix: List[List[float]] = [[0.0] * n for _ in range(n)]
        duration_matrix: List[List[float]] = [[0.0] * n for _ in range(n)]

        for i in range(n):
            lat_i, lon_i = coordinates[i]
            for j in range(n):
                if i == j:
                    distance_matrix[i][j] = 0.0
                    duration_matrix[i][j] = 0.0
                else:
                    lat_j, lon_j = coordinates[j]
                    dist_km = self._calculate_road_distance_km(lat_i, lon_i, lat_j, lon_j)
                    dur_min = self._calculate_travel_duration_minutes(dist_km)
                    distance_matrix[i][j] = dist_km
                    duration_matrix[i][j] = dur_min

        return distance_matrix, duration_matrix


class OSRMProvider(BaseRoutingProvider):
    """
    OpenStreetMap OSRM routing engine integration.
    Queries OSRM table service for exact road routing distances and travel durations.
    Falls back gracefully to FallbackRoadMatrixProvider if OSRM is unreachable.
    """

    def __init__(self, base_url: str = "http://router.project-osrm.org", timeout_seconds: int = 4):
        self.base_url = base_url.rstrip("/")
        self.timeout_seconds = timeout_seconds
        self.fallback_provider = FallbackRoadMatrixProvider()

    def get_distance_and_duration_matrix(
        self, coordinates: List[Tuple[float, float]]
    ) -> Tuple[List[List[float]], List[List[float]]]:
        n = len(coordinates)
        if n <= 1:
            return [[0.0]], [[0.0]]

        # OSRM expects: lon,lat;lon,lat;...
        coord_strings = [f"{lon:.6f},{lat:.6f}" for lat, lon in coordinates]
        coord_path = ";".join(coord_strings)
        url = f"{self.base_url}/table/v1/driving/{coord_path}?annotations=distance,duration"

        try:
            response = requests.get(url, timeout=self.timeout_seconds)
            if response.status_code == 200:
                data = response.json()
                if data.get("code") == "Ok":
                    # distances in meters -> convert to km
                    raw_distances = data.get("distances", [])
                    raw_durations = data.get("durations", []) # in seconds -> convert to minutes

                    dist_matrix = [
                        [round((val or 0.0) / 1000.0, 2) for val in row]
                        for row in raw_distances
                    ]
                    dur_matrix = [
                        [round((val or 0.0) / 60.0, 1) for val in row]
                        for row in raw_durations
                    ]
                    logger.info("OSRM road matrix successfully retrieved for %d nodes", n)
                    return dist_matrix, dur_matrix
        except Exception as e:
            logger.warning("OSRM request failed (%s). Utilizing calibrated FallbackRoadMatrixProvider.", str(e))

        # Fallback to calibrated road matrix
        return self.fallback_provider.get_distance_and_duration_matrix(coordinates)


def get_routing_provider(mode: str = "ROAD_MATRIX") -> BaseRoutingProvider:
    if mode == "OSRM":
        return OSRMProvider()
    return FallbackRoadMatrixProvider()
