// 1) 지도 띄우기: 전 세계(위도0, 경도0), 줌레벨 2
const map = L.map('map').setView([0, 0], 2);

// 2) Esri World Imagery (위성사진) 타일 레이어 불러오기
L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  {
    attribution:
      'Tiles © Esri, Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
  }
).addTo(map);

// 3) 초기 지도 위치/줌 저장 (토글 시 되돌리기 위해)
const initialView = {
  center: map.getCenter(),  // {lat, lng}
  zoom: map.getZoom()       // 숫자
};

// ──────────────────────────────────────────
// 4) 메테켈(에티오피아)용 아이콘 정의
const ethSmallIcon = L.icon({
  iconUrl: 'images/sample-photo.jpg',
  iconSize: [64, 64],
  iconAnchor: [32, 64],
  popupAnchor: [0, -64]
});
const ethLargeIcon = L.icon({
  iconUrl: 'images/sample-photo.jpg',
  iconSize: [512, 512],
  iconAnchor: [64, 128],
  popupAnchor: [0, -128]
});
const markerMetekel = L.marker([10.7803, 35.5658], { icon: ethSmallIcon }).addTo(map);
let metekelEnlarged = false;
markerMetekel.on('click', () => {
  if (!metekelEnlarged) {
    map.flyTo(markerMetekel.getLatLng(), 12, { duration: 1.5 });
    markerMetekel.setIcon(ethLargeIcon);
    metekelEnlarged = true;
  } else {
    map.flyTo(initialView.center, initialView.zoom, { duration: 1.5 });
    markerMetekel.setIcon(ethSmallIcon);
    metekelEnlarged = false;
  }
});

// ──────────────────────────────────────────
// 5) 다카(방글라데시)용 아이콘 정의
const dhaSmallIcon = L.icon({
  iconUrl: 'images/dhaka-photo.jpg',
  iconSize: [64, 64],
  iconAnchor: [32, 64],
  popupAnchor: [0, -64]
});
const dhaLargeIcon = L.icon({
  iconUrl: 'images/dhaka-photo.jpg',
  iconSize: [512, 512],
  iconAnchor: [64, 128],
  popupAnchor: [0, -128]
});
const markerDhaka = L.marker([23.81, 90.415], { icon: dhaSmallIcon }).addTo(map);
let dhakaEnlarged = false;
markerDhaka.on('click', () => {
  if (!dhakaEnlarged) {
    map.flyTo(markerDhaka.getLatLng(), 12, { duration: 1.5 });
    markerDhaka.setIcon(dhaLargeIcon);
    dhakaEnlarged = true;
  } else {
    map.flyTo(initialView.center, initialView.zoom, { duration: 1.5 });
    markerDhaka.setIcon(dhaSmallIcon);
    dhakaEnlarged = false;
  }
});

// ──────────────────────────────────────────
// 6) 자카르타(인도네시아 자바섬)용 아이콘 정의
const jktSmallIcon = L.icon({
  iconUrl: 'images/jakarta-photo.jpg',
  iconSize: [64, 64],
  iconAnchor: [32, 64],
  popupAnchor: [0, -64]
});
const jktLargeIcon = L.icon({
  iconUrl: 'images/jakarta-photo.jpg',
  iconSize: [512, 512],
  iconAnchor: [64, 128],
  popupAnchor: [0, -128]
});
const markerJakarta = L.marker([-6.9, 107.6], { icon: jktSmallIcon }).addTo(map);
let jakartaEnlarged = false;
markerJakarta.on('click', () => {
  if (!jakartaEnlarged) {
    map.flyTo(markerJakarta.getLatLng(), 12, { duration: 1.5 });
    markerJakarta.setIcon(jktLargeIcon);
    jakartaEnlarged = true;
  } else {
    map.flyTo(initialView.center, initialView.zoom, { duration: 1.5 });
    markerJakarta.setIcon(jktSmallIcon);
    jakartaEnlarged = false;
  }
});
