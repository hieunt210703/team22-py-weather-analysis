# Phân tích dữ liệu thời tiết

Tài liệu này ghi chú về sản phẩm ứng dụng phân tích dữ liệu thời tiết.

## Mục tiêu

Phát triển ứng dụng phân tích dữ liệu thời tiết.
Giúp người dùng phổ thông tìm kiếm và đánh giá mức độ phù hợp của điều kiện thời tiết với nhu cầu của mình.

## Ý tưởng

**QUAN TRỌNG:** Dưới đây là các ý tưởng tiềm năng, chưa phải là requirement cuối cùng.

### Ví dụ nhu cầu người dùng

- Sang tháng sau tôi muốn đi du lịch, tỉnh nào có thời tiết phù hợp nhất?
- Năm sau tôi tổ chức đám cưới ở TP.HCM, khoảng thời gian nào tốt nhất?

### Hướng giải quyết

- Ứng dụng chuyển đổi yêu cầu của người dùng thành các tham số phân tích, bao gồm thời gian, địa điểm và tiêu chí thời tiết; sau đó dựa trên dữ liệu lịch sử để đưa ra kết quả phân tích hoặc khuyến nghị.

- Các tiêu chí thời tiết có thể gồm:
  - Lượng mưa cao/thấp
  - Nhiệt độ cao/thấp
  - Tần suất bão cao/thấp
  - Độ ẩm cao/thấp
  > Tùy vào dữ liệu khả dụng và chất lượng dữ liệu, hệ thống sẽ hỗ trợ các tiêu chí phân tích tương ứng.
