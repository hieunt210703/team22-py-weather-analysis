import fs from 'fs';

const raw = JSON.parse(fs.readFileSync('src/data/locations.json', 'utf8'));

// High quality verified coordinates for all 91 locations in Vietnam
const verifiedCoords = {
  // Đồng bằng Bắc Bộ
  'Hà Nội': { lat: 21.0285, lon: 105.8542 },
  'Hải Phòng': { lat: 20.8449, lon: 106.6881 },
  'Bắc Ninh': { lat: 21.1861, lon: 106.0763 },
  'Hải Dương': { lat: 20.9410, lon: 106.3330 },
  'Hưng Yên': { lat: 20.6464, lon: 106.0511 },
  'Thái Bình': { lat: 20.4500, lon: 106.3400 },
  'Hà Nam': { lat: 20.5413, lon: 105.9139 },
  'Nam Định': { lat: 20.4339, lon: 106.1773 },
  'Ninh Bình': { lat: 20.2581, lon: 105.9797 },
  'Vĩnh Phúc': { lat: 21.3089, lon: 105.6049 },
  'Hà Đông': { lat: 20.9714, lon: 105.7788 },
  'Quảng Ninh': { lat: 20.9505, lon: 107.0734 },

  // Đông Bắc & Tây Bắc
  'Bắc Giang': { lat: 21.2731, lon: 106.1946 },
  'Thái Nguyên': { lat: 21.5928, lon: 105.8442 },
  'Tuyên Quang': { lat: 21.8236, lon: 105.2142 },
  'Cao Bằng': { lat: 22.6657, lon: 106.2579 },
  'Bắc Kạn': { lat: 22.1470, lon: 105.8348 },
  'Lạng Sơn': { lat: 21.8526, lon: 106.7610 },
  'Phú Thọ': { lat: 21.3996, lon: 105.2222 },
  'Yên Bái': { lat: 21.7229, lon: 104.9113 },
  'Hà Giang': { lat: 22.8233, lon: 104.9836 },
  'Sơn La': { lat: 21.3256, lon: 103.9188 },
  'Điện Biên': { lat: 21.3860, lon: 103.0230 },
  'Lai Châu': { lat: 22.3964, lon: 103.4582 },
  'Lào Cai': { lat: 22.4856, lon: 103.9707 },
  'Hoà Bình': { lat: 20.8172, lon: 105.3376 },
  'Sa Pa': { lat: 22.3364, lon: 103.8438 },
  'Mộc Châu': { lat: 20.8436, lon: 104.6344 },
  'Tam Đảo': { lat: 21.4583, lon: 105.6472 },

  // Bắc Trung Bộ
  'Thanh Hoá': { lat: 19.8000, lon: 105.7667 },
  'Nghệ An': { lat: 18.6734, lon: 105.6923 },
  'Hà Tĩnh': { lat: 18.3428, lon: 105.9057 },
  'Quảng Bình': { lat: 17.4689, lon: 106.6223 },
  'Quảng Trị': { lat: 16.7508, lon: 107.1828 },
  'Huế': { lat: 16.4637, lon: 107.5909 },
  'Vinh': { lat: 18.6734, lon: 105.6923 },
  'Đồng Hới': { lat: 17.4689, lon: 106.6223 },

  // Trung Trung Bộ & Nam Trung Bộ
  'Đà Nẵng': { lat: 16.0544, lon: 108.2022 },
  'Quảng Nam': { lat: 15.5736, lon: 108.4740 },
  'Hội An': { lat: 15.8801, lon: 108.3380 },
  'Quảng Ngãi': { lat: 15.1205, lon: 108.7923 },
  'Tam Kỳ': { lat: 15.5736, lon: 108.4740 },
  'Nha Trang': { lat: 12.2388, lon: 109.1967 },
  'Bình Định': { lat: 13.7765, lon: 109.2237 },
  'Quy Nhơn': { lat: 13.7765, lon: 109.2237 },
  'Phú Yên': { lat: 13.0882, lon: 109.3134 },
  'Tuy Hoà': { lat: 13.0882, lon: 109.3134 },
  'Khánh Hoà': { lat: 12.2388, lon: 109.1967 },
  'Ninh Thuận': { lat: 11.5643, lon: 108.9886 },
  'Phan Rang': { lat: 11.5643, lon: 108.9886 },
  'Bình Thuận': { lat: 10.9289, lon: 108.1021 },
  'Phan Thiết': { lat: 10.9289, lon: 108.1021 },
  'Cam Ranh': { lat: 11.9214, lon: 109.1591 },

  // Tây Nguyên
  'Đà Lạt': { lat: 11.9404, lon: 108.4583 },
  'Lâm Đồng': { lat: 11.9404, lon: 108.4583 },
  'Đắk Lắk': { lat: 12.6675, lon: 108.0378 },
  'Buôn Ma Thuột': { lat: 12.6675, lon: 108.0378 },
  'Gia Lai': { lat: 13.9833, lon: 108.0000 },
  'Pleiku': { lat: 13.9833, lon: 108.0000 },
  'Kon Tum': { lat: 14.3545, lon: 108.0076 },
  'Đắk Nông': { lat: 12.0042, lon: 107.6907 },
  'Gia Nghĩa': { lat: 12.0042, lon: 107.6907 },
  'Bảo Lộc': { lat: 11.5480, lon: 107.8077 },

  // Đông Nam Bộ
  'Hồ Chí Minh': { lat: 10.8230, lon: 106.6296 },
  'Bình Dương': { lat: 10.9805, lon: 106.6519 },
  'Đồng Nai': { lat: 10.9447, lon: 106.8243 },
  'Biên Hoà': { lat: 10.9447, lon: 106.8243 },
  'Bà Rịa Vũng Tàu': { lat: 10.4114, lon: 107.1362 },
  'Bà Rịa - Vũng Tàu': { lat: 10.4114, lon: 107.1362 },
  'Vũng Tàu': { lat: 10.3460, lon: 107.0843 },
  'Tây Ninh': { lat: 11.3103, lon: 106.0983 },
  'Bình Phước': { lat: 11.7511, lon: 106.9189 },
  'Thủ Đức': { lat: 10.8494, lon: 106.7537 },
  'Củ Chi': { lat: 11.0067, lon: 106.5132 },

  // Tây Nam Bộ
  'Cần Thơ': { lat: 10.0371, lon: 105.7883 },
  'An Giang': { lat: 10.3864, lon: 105.4352 },
  'Long Xuyên': { lat: 10.3864, lon: 105.4352 },
  'Đồng Tháp': { lat: 10.4602, lon: 105.6329 },
  'Cao Lãnh': { lat: 10.4602, lon: 105.6329 },
  'Tiền Giang': { lat: 10.3600, lon: 106.3600 },
  'Mỹ Tho': { lat: 10.3600, lon: 106.3600 },
  'Bến Tre': { lat: 10.2415, lon: 106.3759 },
  'Vĩnh Long': { lat: 10.2537, lon: 105.9722 },
  'Trà Vinh': { lat: 9.9472, lon: 106.3423 },
  'Sóc Trăng': { lat: 9.6000, lon: 105.9719 },
  'Hậu Giang': { lat: 9.7844, lon: 105.4701 },
  'Kiên Giang': { lat: 10.0125, lon: 105.0809 },
  'Rạch Giá': { lat: 10.0125, lon: 105.0809 },
  'Phú Quốc': { lat: 10.2289, lon: 103.9572 },
  'Bạc Liêu': { lat: 9.2941, lon: 105.7278 },
  'Cà Mau': { lat: 9.1768, lon: 105.1524 },
  'Long An': { lat: 10.5367, lon: 106.4116 },
};

raw.locations.forEach(loc => {
  if (verifiedCoords[loc.name]) {
    loc.lat = verifiedCoords[loc.name].lat;
    loc.lon = verifiedCoords[loc.name].lon;
  }
});

fs.writeFileSync('src/data/locations.json', JSON.stringify(raw, null, 2), 'utf8');
fs.writeFileSync('design_handoff_nang_mua/data/locations.json', JSON.stringify(raw, null, 2), 'utf8');
console.log('Successfully updated all locations coordinates!');
