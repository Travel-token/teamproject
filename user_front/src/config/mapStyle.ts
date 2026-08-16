/**
 * react-native-maps의 customMapStyle에 넣는 Google Maps 스타일 JSON입니다.
 * Android + PROVIDER_GOOGLE 조합에서만 적용됩니다 (iOS는 MapView의 userInterfaceStyle로 처리).
 */

export const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1d1f24' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6b7280' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1d1f24' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#2a2d34' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a2d34' }] },
  { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#33363e' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#101216' }] },
];

export const LIGHT_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#f5f6f8' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#9aa1ac' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f6f8' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#e6e8eb' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#e6e8eb' }] },
  { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#dde1e6' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#d9e6f0' }] },
];