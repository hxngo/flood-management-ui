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

// 4) 각 도시의 상세 정보 정의
const cityInfo = {
  metekel: {
    name: "메테켈 (에티오피아)",
    coordinates: [10.7803, 35.5658],
    population: "약 250,000명",
    floodRisk: "높음",
    lastFlood: "2023년 8월",
    description: "에티오피아 북서부 지역으로 벤샹굴-구무즈 주에 위치. 청나일강 유역의 계절적 홍수 위험이 높은 지역입니다.",
    projects: "홍수 조기경보시스템 구축, 배수 인프라 개선",
    climate: "열대 사바나 기후, 6-9월 우기"
  },
  dhaka: {
    name: "다카 (방글라데시)",
    coordinates: [23.81, 90.415],
    population: "약 950만명",
    floodRisk: "매우 높음",
    lastFlood: "2024년 7월",
    description: "방글라데시의 수도로 부리강가와 툴라강, 발루강이 합류하는 델타 지역에 위치. 몬순과 도시화로 인한 홍수 피해가 빈번합니다.",
    projects: "스마트 배수 시스템, 도시 홍수 관리 프로그램",
    climate: "열대 몬순 기후, 6-10월 우기"
  },
  jakarta: {
    name: "자카르타 (인도네시아)",
    coordinates: [-6.9, 107.6],
    population: "약 1,050만명",
    floodRisk: "매우 높음", 
    lastFlood: "2024년 2월",
    description: "인도네시아의 수도로 자바해에 인접한 저지대에 위치. 지반 침하와 해수면 상승으로 홍수 위험이 증가하고 있습니다.",
    projects: "거대 해안 방벽 건설, 신도시 이전 계획",
    climate: "열대 몬순 기후, 10-4월 우기"
  }
};

// ──────────────────────────────────────────
// 5) 공통 마커 생성 함수 (호버 정보 포함)
function createMarkerWithHover(cityKey, smallIcon, largeIcon) {
  const info = cityInfo[cityKey];
  const marker = L.marker(info.coordinates, { icon: smallIcon }).addTo(map);
  let enlarged = false;
  
  // 호버 정보 창 생성
  const popupContent = `
    <div class="city-info-popup">
      <h3 class="city-title">${info.name}</h3>
      <div class="info-grid">
        <div class="info-item">
          <strong>인구:</strong> ${info.population}
        </div>
        <div class="info-item">
          <strong>홍수 위험도:</strong> <span class="risk-${info.floodRisk === '매우 높음' ? 'very-high' : info.floodRisk === '높음' ? 'high' : 'medium'}">${info.floodRisk}</span>
        </div>
        <div class="info-item">
          <strong>최근 홍수:</strong> ${info.lastFlood}
        </div>
        <div class="info-item">
          <strong>기후:</strong> ${info.climate}
        </div>
        <div class="info-description">
          <strong>설명:</strong><br>${info.description}
        </div>
        <div class="info-projects">
          <strong>진행 중인 프로젝트:</strong><br>${info.projects}
        </div>
      </div>
    </div>
  `;
  
  // 마우스 호버 이벤트
  marker.on('mouseover', function() {
    this.bindPopup(popupContent, {
      maxWidth: 350,
      className: 'custom-popup'
    }).openPopup();
  });
  
  marker.on('mouseout', function() {
    this.closePopup();
  });

  // 클릭 이벤트 (기존 확대/축소 기능)
  marker.on('click', function() {
    if (!enlarged) {
      map.flyTo(marker.getLatLng(), 12, { duration: 1.5 });
      marker.setIcon(largeIcon);
      enlarged = true;
    } else {
      map.flyTo(initialView.center, initialView.zoom, { duration: 1.5 });
      marker.setIcon(smallIcon);
      enlarged = false;
    }
  });
  
  return marker;
}

// ──────────────────────────────────────────
// 6) 각 도시별 아이콘 정의 및 마커 생성

// 메테켈 (에티오피아)
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
const markerMetekel = createMarkerWithHover('metekel', ethSmallIcon, ethLargeIcon);

// 다카 (방글라데시)
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
const markerDhaka = createMarkerWithHover('dhaka', dhaSmallIcon, dhaLargeIcon);

// 자카르타 (인도네시아)
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
const markerJakarta = createMarkerWithHover('jakarta', jktSmallIcon, jktLargeIcon);
