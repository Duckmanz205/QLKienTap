**Tổng quan dự án:**

*Mục đích:* Xây dựng ứng dụng quản lý thông tin kiến tập

**Phạm vi:**

*Đối tượng áp dụng:* Ứng dụng phục vụ riêng cho công tác quản lý học phần Kiến tập của Khoa Công nghệ Thực phẩm; không dùng chung cho các khoa/ngành khác do quy định và quy trình kiến tập là đặc thù riêng của Khoa.

*Trong phạm vi:*

● 	Quản trị danh mục nền phục vụ nghiệp vụ: Năm học, Học kỳ, Khóa, Nhà máy, Sinh viên, Giảng viên.  
● 	Quản lý toàn bộ vòng đời một đợt kiến tập: tạo đợt, tạo lịch, mở đăng ký, tổ chức chuyến tham quan (trực tiếp/trực tuyến, do khoa tổ chức hoặc tự do), lọc và chốt danh sách theo thứ tự ưu tiên.  
● 	Quản lý đăng ký/hủy đăng ký của sinh viên, bao gồm xét duyệt minh chứng hủy đăng ký và các chế tài mất quyền đăng ký/mất quyền ưu tiên.  
● 	Phân công Giảng viên hướng dẫn và Giảng viên dẫn đoàn cho từng chuyến/sinh viên.  
● 	Điểm danh, theo dõi lịch trình chuyến tham quan.  
● 	Ghi nhận điểm chuẩn bị, điểm cộng; chấm điểm bài thu hoạch với gợi ý điểm số từ mô hình AI (GVHD có quyền quyết định cuối cùng); tổ chức Hội đồng và ghi điểm báo cáo TQNM; sinh viên chọn bộ 3 chuyến chính thức để báo cáo.  
● 	Tổng hợp điểm, khóa điểm và công bố kết quả học phần cho sinh viên.  
● 	Thanh toán lệ phí qua hình thức chuyển khoản có đối chiếu tự động bằng mã QR/nội dung chuyển khoản; theo dõi và duyệt yêu cầu hoàn phí, không thực hiện chi tiền qua hệ thống.  
● 	Thông báo, nhắc nhở tự động và báo cáo thống kê phục vụ quản lý và báo cáo học vụ.

*Ngoài phạm vi:*

● 	Không tổ chức, lưu trữ hay chấm tự động bài kiểm tra trắc nghiệm điểm chuẩn bị — việc này thực hiện bằng công cụ ngoài hệ thống, hệ thống chỉ tiếp nhận điểm do Giảng viên dẫn đoàn nhập vào.  
● 	Không tích hợp cổng thanh toán trực tuyến (VNPay, MoMo...) hay thực hiện chi trả hoàn phí tự động; các giao dịch tiền thực tế vẫn xử lý thủ công theo quy trình tài chính hiện hành của trường (nộp/duyệt đơn tại VPK).  
● 	Không xây dựng thuật toán xếp lịch/ghép cặp tối ưu theo nguyện vọng đa tiêu chí; việc phân bổ sinh viên vào chuyến tham quan thực hiện theo cơ chế đăng ký và lọc theo thứ tự ưu tiên đã quy định (Loại danh sách đen, K12/K13 chưa hoàn thành, K14 đã đăng ký nhưng chưa tham quan, K14 chưa hoàn thành, thứ tự đăng ký).  
● 	Không áp dụng, không tùy biến cho học phần thực tập tốt nghiệp hoặc các học phần khác ngoài Kiến tập

**Đối tượng người dùng:** Quản lý khoa, Giảng viên, Sinh viên

**Sơ đồ luồng hoạt động tổng quan**

**Yêu cầu chức năng**  
       	**Module 1: Cấu hình và quản trị hệ thống**

1\.    **Chức năng đăng nhập:**

      	

| Tên chức năng | Đăng nhập |
| :---- | :---- |
| **Mô tả** | Cho phép người dùng (Quản lý khoa, Giảng viên, Sinh viên) truy cập vào hệ thống. Hệ thống không có chức năng "Đăng ký tài khoản" tự do; toàn bộ tài khoản do hệ thống cấp phát từ trước. |
| **Actor** | Quản lý khoa, Giảng viên, Sinh viên |
| **Tiền điều kiện** | Tài khoản người dùng phải được gắn cứng hoặc được khởi tạo bởi tài khoản của quản lý khoa |
| **Luồng xử lý nghiệp vụ** | 1\.    Người dùng thực hiện đăng nhập vào trong hệ thống 2\.    Người dùng thực hiện việc đăng nhập bằng tài khoản đã được cấp 3\.    Người dùng thực hiện chức năng đăng nhập 4\.    Hệ thống sẽ điều hướng dựa trên vai trò được tạo |
| **Luồng ngoại lệ** | \-       Bỏ trống thông tin: Nếu người dùng không nhập Username hoặc Password, hệ thống bôi đỏ trường tương ứng và báo lỗi: "Vui lòng nhập đầy đủ thông tin". \-       Sai thông tin: Nếu Username hoặc Password không đúng, hệ thống hiển thị thông báo: "Tên đăng nhập hoặc mật khẩu không chính xác". \-       Tài khoản bị khóa: Nếu tài khoản đang ở trạng thái "Inactive" hoặc "Banned", hệ thống hiển thị: "Tài khoản của bạn đã bị khóa, vui lòng liên hệ quản lý Khoa". |
| **Quy tắc nghiệp vụ** | \-       Nhập sai thông tin 5 lần liên tiếp, khóa tài khoản trong vòng 5 phút \-       Mật khẩu truyền đi phải được mã hóa \-       Đối với Admin: Tên đăng nhập tự định nghĩa và mật khẩu khởi tạo được cấp riêng \-       Đối với Giảng viên: Tên đăng nhập là mã Giảng viên và mật khẩu lần đầu khởi tạo mặc định là mã Giảng viên \-       Đối với Sinh Viên: Tên đăng nhập là mã Sinh viên và mật khẩu lần đầu khởi tạo mặc định là mã Sinh viên \-       Hệ thống phân biệt 3 vai trò đăng nhập (Quản lý khoa, Giảng viên — có thể kiêm cả vai trò GVHD lẫn GV dẫn đoàn, Sinh viên); một tài khoản Giảng viên có thể đồng thời giữ nhiều vai trò nghiệp vụ nhưng chỉ có một bộ thông tin đăng nhập duy nhất. |

 

2\.    **Chức năng đăng xuất**

 

| Tên chức năng | Đăng xuất |
| :---- | :---- |
| **Mô tả** | Cho phép người dùng kết thúc phiên làm việc an toàn, ngăn chặn việc truy cập trái phép vào tài khoản khi không còn sử dụng thiết bị. |
| **Actor** | Quản lý khoa, Giảng viên, Sinh viên |
| **Tiền điều kiện** | Người dùng đăng nhập thành công vào hệ thống |
| **Luồng xử lý nghiệp vụ** | 1\.	Người dùng chọn chức năng đăng xuất 2\.	Hệ thống hiển thị popup xác nhận: "Bạn có chắc chắn muốn thoát khỏi hệ thống?" 3\.	Người dùng chọn “Đồng ý”. 4\.	Người dùng được điều hướng về màn hình đăng nhập |
| **Luồng ngoại lệ** | \-   	Chọn “Không”: Nếu người dùng chọn “Không” trên popup thực hiện tắt popup và không đăng xuất tài khoản của người dùng |

 

3\.    **Chức năng Quản lý tài khoản**

 

| Tên chức năng | Quản lý tài khoản |
| :---- | :---- |
| **Mô tả** | Quản lý thông tin tài khoản của tất cả các người dùng trên hệ thống, có thể khóa, reset mật khẩu của người dùng |
| **Actor** | Quản lý khoa |
| **Tiền điều kiện** | Người dùng đăng nhập thành công vào hệ thống |
| **Luồng xử lý nghiệp vụ** | 1\.	Người dùng thực hiện chức năng “Quản lý thông tin” 2\.	Hệ thống hiển thị thông tin người dùng 3\.	Người dùng có thể thêm tài khoản hay thực hiện các chức năng khóa tài khoản, reset mật khẩu, chỉnh sửa thông tin  |
| **Luồng ngoại lệ** | \-   Không thêm trùng được tài khoản hiện có trong danh sách \-   Reset mật khẩu là sẽ reset về thành mã của Sinh viên/Giảng viên  |
| **Quy tắc nghiệp vụ** | \-   	Không thêm trùng được tài khoản hiện có trong danh sách \-   Reset mật khẩu là sẽ reset về thành mã của Sinh viên/Giảng viên  |

4\.    **Chức năng đổi mật khẩu**

 

| Tên chức năng | Đổi mật khẩu |
| :---- | :---- |
| **Mô tả** | Dùng để thay đổi mật khẩu mặc định |
| **Actor** | Giảng viên, Sinh viên |
| **Tiền điều kiện** | Người dùng đăng nhập thành công vào hệ thống |
| **Luồng xử lý nghiệp vụ** | 1\.	Người dùng truy cập vào quản lý tài khoản 2\.	Truy cập vào chức năng đổi mật khẩu 3\.	Nhập mật khẩu hiện tại 4\.	Nhập và xác nhận lại mật khẩu mới 5\.	Thực hiện chức năng xác nhận mật khẩu |
| **Luồng ngoại lệ** | \-   	Mật khẩu mới không được trùng với mật khẩu cũ \-   	Mật khẩu phải đảm bảo được độ bảo mật cần thiết |
| **Quy tắc nghiệp vụ** | \-   	Mật khẩu mới phải đạt độ phức tạp tối thiểu (ví dụ ≥ 8 ký tự, có chữ hoa, chữ thường và số) \-   	Đối với Giảng viên/Sinh viên dùng mật khẩu mặc định (trùng mã số), hệ thống bắt buộc đổi mật khẩu ngay lần đăng nhập đầu tiên trước khi được thao tác chức năng khác |

 

5\.    **Chức năng Quản lý danh sách nhà máy**

   
 

| Tên chức năng | Quản lý danh sách nhà máy |
| :---- | :---- |
| **Mô tả** | Cho phép quản lý danh sách các nhà máy/doanh nghiệp đối tác để phục vụ cho việc tạo lịch trình và phân bổ sinh viên đi kiến tập. |
| **Actor** | Quản lý khoa |
| **Tiền điều kiện** | Người dùng đăng nhập thành công vào hệ thống |
| **Luồng xử lý nghiệp vụ** | 1\.	Người dùng chọn chức năng Quản lý nhà máy 2\.	Người dùng thực hiện chức năng thêm, thêm, xóa, sửa danh sách nhà máy |
| **Luồng ngoại lệ** | \-   	Thêm bằng file dữ liệu: Người dùng có thể thêm bằng file dữ liệu excel hoặc csv để thêm hàng loạt \-   	Nhà máy đã và đang diễn ra kiến tập chỉ được lưu trữ không được xóa |
| **Quy tắc nghiệp vụ** | \-   	Nhà máy đã/đang có chuyến tham quan không được xóa cứng; chỉ được chuyển trạng thái 'Ngừng hợp tác' để giữ toàn vẹn dữ liệu lịch sử và điểm số liên quan \-   	Mỗi nhà máy phải khai báo rõ hình thức hỗ trợ tham quan: chỉ trực tiếp (offline), chỉ trực tuyến (online) hoặc cả hai |

6\.    **Chức năng thông báo (Quản lý khoa)**

 

| Tên chức năng | Quản lý thông báo |
| :---- | :---- |
| **Mô tả** | Cho phép quản lý thông báo để tiến hành thông báo đến cho sinh viên và giảng viên |
| **Actor** | Quản lý khoa |
| **Tiền điều kiện** | Người dùng đăng nhập thành công vào hệ thống |
| **Luồng xử lý nghiệp vụ** | 1\.	Người dùng truy cập vào Quản lý thông báo 2\.	Người dùng thêm mới thông báo 3\.	Hệ thống sẽ gửi thông báo đến cho tất cả sinh viên và giảng viên |
| **Luồng ngoại lệ** | \-   	Nếu chỉnh sửa sau khi gửi: Thực hiện thông báo lại cho người dùng và phải để rõ nhãn “Đã chỉnh sửa lúc \[thời gian\]” \-   	Có thể có nhiều file đính kèm không vượt quá 10MB |
| **Quy tắc nghiệp vụ** | \-   	File đính kèm: cho phép nhiều file, mỗi file dung lượng không vượt quá 10MB \-   	Thông báo có thể gắn đối tượng nhận theo Khóa/Đợt kiến tập cụ thể thay vì luôn gửi toàn bộ sinh viên và giảng viên \-   	Thông báo đã gửi mà bị chỉnh sửa phải hiển thị nhãn 'Đã chỉnh sửa lúc \[thời gian\]' và gửi lại thông báo cập nhật cho người nhận cũ |

7\.    **Chức năng Quản lý sinh viên**

 

| Tên chức năng | Quản lý sinh viên |
| :---- | :---- |
| **Mô tả** | Cho phép quản lý danh sách sinh viên |
| **Actor** | Quản lý khoa |
| **Tiền điều kiện** | Người dùng đăng nhập thành công vào hệ thống |
| **Luồng xử lý nghiệp vụ** | 1\.	Người dùng truy cập vào chức năng quản lý sinh viên 2\.	Người dùng thực hiện CRUD danh sách sinh viên |
| **Luồng ngoại lệ** | \-   	Import file: Người dùng có thể import danh sách sinh viên từ file excel hoặc csv |
| **Quy tắc nghiệp vụ** | \-   	Mã số sinh viên là khóa định danh duy nhất trong toàn hệ thống \-   	Sinh viên phải được gắn với một Khóa hợp lệ đã tồn tại trong danh mục nền trước khi được kích hoạt tài khoản (sử dụng cơ chế cắt chuỗi để lấy Khóa. VD:14DHTP01 nhận diện là Khóa 14\) |

8\.    **Chức năng Quản lý danh mục nền**

 

| Tên chức năng | Quản lý danh mục nền (Khóa, Năm học, Học kỳ) |
| :---- | :---- |
| **Mô tả** | Cho phép khởi tạo, cập nhật thông tin về Khóa học, Năm học và Học kỳ để làm dữ liệu nền cho các phân hệ khác |
| **Actor** | Quản lý khoa |
| **Tiền điều kiện** | Người dùng đăng nhập thành công vào hệ thống |
| **Luồng xử lý nghiệp vụ** | 1\.	Người dùng chọn danh mục Quản lý nền 2\.	Người dùng chọn chức năng tương ứng (Khóa, Năm học, Học kỳ) 3\.	Người dùng thực hiện CRUD với chức năng tương ứng |
| **Luồng ngoại lệ** | \-   	Năm học: Không thể xóa năm học nếu có học kỳ đã được gắn vào \-   	Khóa: Không thể xóa khóa nếu như có sinh viên nằm trong khóa đó |
| **Quy tắc nghiệp vụ** | \-   	Mỗi Học kỳ phải thuộc đúng một Năm học và có khoảng thời gian không chồng lấn với học kỳ liền kề trong cùng năm học \-   	Khóa học được gắn với năm học cụ thể để phục vụ làm dữ liệu đầu vào cho ràng buộc 'chỉ SV từ năm 2 trở lên được đăng ký kiến tập' \-   	không xóa được Năm học đã gắn Học kỳ; không xóa được Khóa đã có sinh viên |

9\.    **Quản lý đợt kiến tập**

 

| Tên chức năng | Quản lý đợt kiến tập |
| :---- | :---- |
| **Mô tả** | Dùng để quản lý các đợt kiến tập |
| **Actor** | Quản lý khoa |
| **Tiền điều kiện** | Có thông tin về dữ liệu nền (Năm học, học kỳ, khóa) |
| **Luồng xử lý nghiệp vụ** | 1\.	Người dùng truy cập chức năng thêm mới đợt kiến tập 2\.	Người dùng chọn Năm học \+ Học kỳ áp dụng 3\.	Người dùng nhập tên đợt kiến tập (hệ thống gợi ý theo mẫu, cho sửa) 4\.	Người dùng nhập khung thời gian tổng thể của đợt (ngày bắt đầu – ngày kết thúc) — đây là biên bao trùm mọi Lịch kiến tập con 5\.	Hệ thống khởi tạo đợt ở trạng thái "Nháp" 6\.	Người dùng thực hiện chức năng "Thêm Lịch kiến tập" 7\.	Khi có ít nhất 1 Lịch kiến tập con đã hoàn tất bước Xác nhận danh sách, hệ thống tự động cập nhật trạng thái đợt sang "Đang triển khai" 8\.	Hệ thống tự động chuyển đợt sang "Đã kết thúc" khi tất cả Lịch kiến tập con đã quá hạn chốt điểm 9\.	Khi tất cả Lịch kiến tập con đã khóa điểm, hệ thống tự động chuyển đợt sang "Đã khóa" |
| **Luồng ngoại lệ** | \-   	Không xóa được đợt nếu đã có Lịch kiến tập con được tạo \-   	Không xóa được một Lịch kiến tập con nếu đã có danh sách sinh viên được xác nhận |
| **Quy tắc nghiệp vụ** | \-   	Tên đợt kiến tập là duy nhất trong phạm vi 1 Năm học \+ Học kỳ \-   	Trạng thái của Đợt được tính toán tự động từ trạng thái tổng hợp của các Lịch kiến tập con — không cho người dùng nhập tay, tránh lệch dữ liệu \-   	Trong cùng 1 Học kỳ chỉ nên có 1 Đợt kiến tập chính thức, để nhà máy/chuyến tham quan dùng chung không bị phân mảnh giữa nhiều đợt |

10\. **Quản lý chuyến tham quan kiến tập**

 

| Tên chức năng | Quản lý chuyến tham quan kiến tập |
| :---- | :---- |
| **Mô tả** | Dùng để quản lý các chuyến tham quan kiến tập của đợt kiến tập |
| **Actor** | Quản lý khoa |
| **Tiền điều kiện** | \- Đợt kiến tập đã được khởi tạo trên hệ thống \- Các nhà máy tiếp nhận đã được khởi tạo trên hệ thống \- Sinh viên đề xuất nhà máy kiến tập |
| **Luồng xử lý nghiệp vụ** | 1\.	Người dùng thực hiện chức năng thêm mới chuyến tham quan 2\.	Người dùng chọn nhà máy tiếp nhận 3\.	Người dùng nhập giờ, ngày, tháng, năm cho chuyến tham quan 4\.	Người dùng nhập số lượng của tiếp nhận 5\.	Người dùng nhấn chức năng thêm mới 6\.	Người dùng nhấn duyệt hoặc từ chối các chuyến tham quan tự do a. 	Nếu duyệt: hệ thống kiểm tra sinh viên đề xuất đã có GVHD đang hoạt động chưa — nếu có, tự động gán GVHD đó làm giảng viên dẫn đoàn của chuyến này; nếu chưa có, đánh dấu chuyến ở trạng thái "Chờ gán GV dẫn đoàn" b.	Nếu từ chối: nhập lý do từ chối; thông báo cho sinh viên bị từ chối |
| **Luồng ngoại lệ** | \-   	Không thể xóa chuyến tham quan kiến tập đã có sinh viên đăng ký |
| **Quy tắc nghiệp vụ** | \-   	Chuyến tham quan phải gắn hình thức trực tiếp/trực tuyến phù hợp với cấu hình hỗ trợ của nhà máy tương ứng \-   	Số lượng tiếp nhận phải là số nguyên dương; không cho tạo hai chuyến cùng nhà máy trùng khung giờ \-   	Đối với chuyến tham quan 'tự do' do sinh viên đề xuất: Quản lý khoa phải duyệt thông tin nhà máy trong vòng tối thiểu 24 giờ trước khi sinh viên được phép chọn nhà máy đó khi nộp báo cáo; chuyến bị từ chối sẽ không xuất hiện trong danh mục chọn \-   	Không thể xóa chuyến đã có sinh viên đăng ký \-   	Mỗi chuyến tự do chỉ phục vụ đúng 1 sinh viên (sức chứa \= 1\) — để tránh trường hợp có sinh viên khác đăng ký chung chuyến tự do đó nhưng có GVHD khác |

11\. **Quản lý giảng viên**

 

| Tên chức năng | Quản lý giảng viên |
| :---- | :---- |
| **Mô tả** | Dùng để quản lý thông tin giảng viên tham gia trong đợt kiến tập |
| **Actor** | Quản lý khoa |
| **Tiền điều kiện** | Người dùng đã đăng nhập vào trong hệ thống |
| **Luồng xử lý nghiệp vụ** | 1\.	Người dùng Import danh sách giảng viên 2\.	Người dùng thực hiện CRUD cho danh sách giảng viên |
| **Luồng ngoại lệ** | \-   	Không thể xóa giảng viên đã hướng dẫn kiến tập |
| **Quy tắc nghiệp vụ** | \-   	Một giảng viên có thể đồng thời đảm nhận vai trò GVHD (chấm bài thu hoạch) và GV dẫn đoàn (điểm danh, ghi điểm thưởng) cho các chuyến khác nhau — đây là hai vai trò độc lập, không loại trừ nhau \-   	Không thể xóa giảng viên đã từng là GVHD hoặc đã từng được phân công dẫn đoàn |

      	

12\. **Tự động nhắc nhở**

 

| Tên chức năng | Tự động nhắc nhở |
| :---- | :---- |
| **Mô tả** | Hệ thống chạy ngầm tự động quét cơ sở dữ liệu hàng ngày để tìm kiếm các chuyến kiến tập sắp diễn ra vào ngày hôm sau. Sau đó, hệ thống tự động đẩy thông báo đến thiết bị di động của Sinh viên để nhắc nhở chuẩn bị |
| **Actor** | Hệ thống: Thực thi quét dữ liệu Sinh viên: Người nhận |
| **Tiền điều kiện** | Có lịch trình cố định để tự động quét thông báo |
| **Luồng xử lý nghiệp vụ** | 1\.	Hệ thống tự động quét trong danh sách chuyến tham quan, lịch kiến tập, điểm số đã được khóa,... 2\.	Hệ thống gửi thông báo đến Sinh viên liên quan 3\.	Sinh viên nhận thông báo đẩy nhắc nhở |
| **Luồng ngoại lệ** | \-   	Không thông báo nếu không có sự kiện nào diễn ra trong ngày và ngày mai |
| **Quy tắc nghiệp vụ** | \-   	Nhắc sinh viên trước các mốc: hạn nộp báo cáo không trừ điểm (10 ngày), hạn chót nộp báo cáo (21 ngày), hạn đóng phí của từng chuyến \-   	Cảnh báo sinh viên và Quản lý khoa khi một chuyến tham quan đã hoàn thành sắp hết hạn bảo lưu 18 tháng mà sinh viên vẫn chưa hoàn tất đủ 3 chuyến hợp lệ \-   	Nhắc giảng viên dẫn đoàn/Sinh viên trước ngày tổ chức chuyến tham quan; nhắc GVHD khi có bài thu hoạch mới cần chấm gần đến hạn |

   
 

**Module 2: Quản lý Kế hoạch & Đăng ký Kiến tập**

13\. **Quản lý lịch kiến tập**

 

| Tên chức năng | Quản lý lịch kiến tập |
| :---- | :---- |
| **Mô tả** | Dùng để thiết lập kế hoạch cụ thể cho đợt sinh viên tham gia kiến tập |
| **Actor** | Quản lý khoa |
| **Tiền điều kiện** | Có dữ liệu nền (Năm học, học kỳ, khóa) Có dữ liệu sinh viên đăng ký học phần kiến tập theo mẫu đề xuất Đợt kiến tập đã được khởi tạo |
| **Luồng xử lý nghiệp vụ** | 1\.	Người dùng truy cập chức năng thêm mới 2\.	Người dùng chọn Đợt kiến tập 3\.	Người dùng chọn Khóa 4\.	Người dùng thực hiện nhập thông tin thời gian mở cổng đăng ký (từ ngày ../../.. đến ngày ../../..) 5\.	Người dùng nhập thời gian diễn ra đợt kiến tập (từ ngày ../../.. đến ngày ../../..) 6\.	Người dùng nhập hạn chót nộp báo cáo 7\.	Người dùng nhập hạn chót chốt điểm 8\.	Người dùng chọn chức năng Tải danh sách Sinh viên 9\.	Người dùng chọn file danh sách sinh viên theo mẫu đề xuất 10\. Hệ thống tự động thêm sinh viên tham gia học phần kiến tập vào lịch kiến tập 11\. Người dùng đối chiếu dữ liệu và danh sách 12\. Người dùng thực hiện chức năng Xác nhận |
| **Luồng ngoại lệ** | \-   	Báo lỗi khi nhận file dữ liệu khác mẫu \-   	Báo lỗi khi sinh viên không nằm trong danh sách \-   	Cảnh báo khi trùng sinh viên đang thực hiện kiến tập tại lịch khác chưa kết thúc |
| **Quy tắc nghiệp vụ** | \-   	Một sinh viên chỉ được phép nằm trong 1 lịch kiến tập học phần kiến tập đang hoạt động tại một thời điểm \-   	Ngay khi sinh viên được lưu vào lịch kiến tập, hệ thống tự động chạy ngầm hàm quét lịch sử để hiển thị ma trận các chuyến đi hợp lệ (\< 18 tháng, trạng thái đã điểm danh) theo đầy đủ thông tin: họ tên, MSSV, lớp, chuyến tham quan (nhà máy \+ ngày), loại hình (trực tiếp/trực tuyến), cách tổ chức (khoa tổ chức hay tự do), điểm chuẩn bị theo từng nhà máy, điểm cộng theo từng nhà máy, điểm bài báo cáo, điểm vấn đáp |

 

14\. **Quản lý đăng ký kiến tập**

 

| Tên chức năng | Quản lý đăng ký kiến tập |
| :---- | :---- |
| **Mô tả** | Dùng để quản lý thông tin, trạng thái của phiếu đăng ký chuyến tham quan kiến tập của sinh viên |
| **Actor** | Quản lý khoa |
| **Tiền điều kiện** | Khoa mở đăng ký kiến tập Sinh viên thực hiện chức năng đăng ký kiến tập |
| **Luồng xử lý nghiệp vụ** | 1\.	Truy cập vào chức năng Quản lý đăng ký kiến tập 2\.	Thực hiện thao tác cập nhật chuyến tham quan kiến tập cho sinh viên 3\.	Hệ thống cập nhật trạng thái cho phiếu đăng ký 4\.	Khi có phiếu hủy đăng ký kèm minh chứng, Quản lý khoa xem minh chứng và chọn Duyệt hoặc Từ chối a. 	Nếu Duyệt, phiếu chuyển "Đã hủy", không đưa vào danh sách đen b.	Nếu Từ chối, phiếu vẫn "Đã hủy" nhưng sinh viên bị đưa vào danh sách đen theo tiêu chí "nhầm/trùng lịch không có minh chứng rõ ràng" |
| **Luồng ngoại lệ** | \-   	Không thể cập nhật chuyến tham quan kiến tập đã đủ chỗ \-   	Quản lý khoa có thể cập nhật trạng thái khi có yêu cầu phát sinh \-   	Nếu sinh viên hủy đăng ký mà không đính kèm minh chứng, hệ thống tự động đưa vào danh sách đen, bỏ qua bước duyệt của Quản lý khoa |
| **Quy tắc nghiệp vụ** | \-   	8 trạng thái của  phiếu đăng ký: Chờ duyệt, Hợp lệ, Bị loại, Đã hủy, Đã tham gia, Vắng mặt, Hoàn thành, Không đạt \-   	Khi chốt danh sách chính thức, ưu tiên xử lý theo thứ tự: (1) sinh viên không thuộc danh sách mất quyền đăng ký/mất quyền ưu tiên còn hiệu lực, (2) thời điểm đăng ký sớm hơn |

15\. **Đăng ký kiến tập**

 

| Tên chức năng | Đăng ký kiến tập |
| :---- | :---- |
| **Mô tả** | Dùng để sinh viên thực hiện việc đăng ký kiến tập |
| **Actor** | Sinh viên |
| **Tiền điều kiện** | Khoa mở đăng ký kiến tập Sinh viên đăng nhập vào hệ thống |
| **Luồng xử lý nghiệp vụ** | 1\.	Đăng nhập vào hệ thống 2\.	Truy cập vào chức năng đăng ký nhà máy 3\.	Chọn chuyến tham quan nhà máy 4\.	Thực hiện chức năng đăng ký |
| **Luồng ngoại lệ** | \-   	Sinh viên không thể đăng ký chuyến đi cùng 1 ngày \-   	Đối với sinh viên TQNM tự do: Thực hiện chức năng đăng ký tự do và khai báo thông tin liên quan |
| **Quy tắc nghiệp vụ** | \-   	Chỉ sinh viên từ năm thứ 2 trở đi mới được phép đăng ký \-   	Không được đăng ký hai chuyến trùng ngày \-   	Sinh viên đang trong thời gian 'mất quyền ưu tiên N chuyến tiếp theo' bị giới hạn tương ứng: được nộp phiếu nhưng luôn xếp ưu tiên thấp nhất khi chốt danh sách (mất quyền ưu tiên); số chuyến còn lại của lệnh phạt phải được đếm lùi mỗi khi có một chuyến do khoa tổ chức diễn ra \-   	Với chuyến tự do: sinh viên phải khai báo nhà máy và được duyệt trước khi được ghi nhận là đã đăng ký \-   	Không giới hạn số lần đăng ký/số nhà máy; sinh viên được đăng ký trùng nhà máy đã tham quan để cải thiện điểm |

 

16\. **Hủy đăng ký kiến tập**

   
 

| Tên chức năng | Hủy đăng ký kiến tập |
| :---- | :---- |
| **Mô tả** | Cho phép sinh viên hủy phiếu đăng ký chuyến tham quan đã đăng ký thành công khi có lý do chính đáng (nhầm lẫn, trùng lịch...) |
| **Actor** | Sinh viên |
| **Tiền điều kiện** | \-   	Sinh viên có phiếu đăng ký ở trạng thái Chờ duyệt hoặc Đã duyệt cho chuyến tham quan chưa diễn ra |
| **Luồng xử lý nghiệp vụ** | 1\.	Sinh viên truy cập danh sách các chuyến đã đăng ký. 2\.	Chọn chuyến muốn hủy và chọn chức năng "Hủy đăng ký". 3\.	Nhập lý do hủy đăng ký. 4\.	Xác nhận hủy; hệ thống cập nhật trạng thái phiếu đăng ký thành "Đã hủy" |
| **Luồng ngoại lệ** | \-   	Không thể hủy sau khi chuyến tham quan đã diễn ra \-   	Không thể hủy trong vòng 24 giờ trước giờ khởi hành |
| **Quy tắc nghiệp vụ** | \-   	Mỗi lần sinh viên chủ động hủy do lỗi cá nhân (nhầm lẫn/trùng lịch) sẽ bị đưa vào danh sách nhắc nhở và mất quyền ưu tiên trong 3 chuyến tham quan tiếp theo do khoa tổ chức \-   	Số lần hủy đăng ký của từng sinh viên được lưu vết để phục vụ thống kê và cảnh báo sớm cho GVHD/cố vấn học tập |

 

      	**Module 3: Nghiệp vụ Phân công**

17\. **Phân công sinh viên**

 

| Tên chức năng | Phân công sinh viên |
| :---- | :---- |
| **Mô tả** | Dùng để phân công sinh viên theo danh sách ưu tiên và danh sách mất quyền ưu tiên |
| **Actor** | Quản lý khoa |
| **Tiền điều kiện** | Đợt đăng ký chuyến tham quan kiến tập đã kết thúc, trạng thái của các phiếu đang ở dạng “Pending” |
| **Luồng xử lý nghiệp vụ** | 1\.	Truy cập vào chức năng Phân công sinh viên 2\.	Hệ thống đưa ra danh sách chuyến tham quan đã kết thúc đợt đăng ký 3\.	Chọn chuyến tham quan cần xem danh sách sinh viên 4\.	Hệ thống tự động lọc sinh viên đủ theo số lượng và theo 3 tầng: a. 	Loại sinh viên thuộc danh sách đen b.	Ưu tiên lần lượt: (a) K12/K13 chưa từng TQNM nhà máy nào, (b) K14 chưa từng TQNM (Đã đăng ký học phần) c. 	Phần còn lại, xếp theo thứ tự đăng ký trước–sau đến khi đủ số lượng tiếp nhận 5\.	Chọn xác nhận danh sách 6\.	Hệ thống tự động cập nhật trạng thái cho tất cả các phiếu đăng ký của sinh viên |
| **Luồng ngoại lệ** | \-   	Bộ lọc 'đủ điều kiện' khi phân công gồm: đạt điều kiện năm học (năm 2), chưa đủ 3 chuyến hợp lệ, không trùng lịch với chuyến khác đã được duyệt, không đang trong thời hạn mất quyền đăng ký \-   	Làm rõ và tách riêng hai sổ đếm cho từng sinh viên: 'số chuyến còn lại bị mất quyền đăng ký' (áp dụng khi tự hủy do nhầm/trùng lịch, khởi tạo \= 3\) và 'số chuyến còn lại bị mất quyền ưu tiên' (áp dụng khi không đóng phí/bỏ chuyến không lý do, khởi tạo \= 5\) \-   	Quy tắc 'Không đạt và không bảo lưu' chỉ áp dụng cho các chuyến tham quan nằm trong phạm vi lần đăng ký học phần đã bị đánh Không đạt đó trở về trước, không áp dụng cho các chuyến tham quan sinh viên thực hiện sau lần đăng ký đó |

 

18\. **Phân công Giảng viên hướng dẫn**

 

| Tên chức năng | Phân công Giảng viên hướng dẫn |
| :---- | :---- |
| **Mô tả** | Dùng để phân công giảng viên hướng dẫn cho các bài báo cáo kiến tập |
| **Actor** | Quản lý khoa |
| **Tiền điều kiện** | Sinh viên đã được thêm vào Lịch kiến tập |
| **Luồng xử lý nghiệp vụ** |   |
| **Luồng ngoại lệ** | \-   	Không thể phân công GVHD cho sinh viên đã có GVHD đang hoạt động |
| **Quy tắc nghiệp vụ** | \-   	Mỗi sinh viên chỉ có một GVHD tại một thời điểm cho một lần đăng ký học phần \-   	Khi phân công GVHD cho một sinh viên, hệ thống tự động rà soát và gán GVHD đó vào vai trò giảng viên dẫn đoàn cho mọi chuyến tự do của sinh viên này đang ở trạng thái "Chờ gán GV dẫn đoàn" |

 

19\. **Phân công Giảng viên dẫn đoàn**

 

| Tên chức năng | Phân công Giảng viên dẫn đoàn |
| :---- | :---- |
| **Mô tả** | Dùng để phân công giảng viên dẫn đoàn cho chuyến tham quan, áp dụng cho cả hình thức trực tiếp và trực tuyến, đảm nhận vai trò điều phối, điểm danh và hướng dẫn sinh viên |
| **Actor** | Quản lý khoa |
| **Tiền điều kiện** | \-   	Hệ thống có chuyến tham quan |
| **Luồng xử lý nghiệp vụ** | 1\.	Truy cập vào chức năng phân công giảng viên dẫn đoàn 2\.	Hệ thống đưa ra danh sách các chuyến tham quan đã khởi tạo 3\.	Chọn giảng viên dẫn đoàn từ danh sách giảng viên 4\.	Chọn chức năng Xác nhận |
| **Luồng ngoại lệ** | \-   	Giảng viên không được dẫn 2 đoàn cùng 1 ngày \-   	Không thể cập nhật giảng viên dẫn đoàn sau khi chuyến tham quan đã được khởi hành \-   	Đối với chuyến tham quan tự do: GVHD sẽ được cấp làm GV dẫn đoàn |
| **Quy tắc nghiệp vụ** | \-   	GV không dẫn 2 đoàn cùng ngày; không đổi GV dẫn đoàn sau khi chuyến đã khởi hành \-   	GV dẫn đoàn không bắt buộc phải là GVHD của các sinh viên trong đoàn — hai vai trò độc lập |

 

**Module 4: Quản lý Quá trình Kiến tập**

20\. **Xem lịch dẫn đoàn**

 

| Tên chức năng | Xem lịch dẫn đoàn |
| :---- | :---- |
| **Mô tả** | Dùng để xem lịch dẫn đoàn được phân công |
| **Actor** | Giảng viên |
| **Tiền điều kiện** | \-   	Quản lý khoa đã thực hiện chức năng phân công cho giảng viên \-   	Giảng viên đã đăng nhập vào trong hệ thống |
| **Luồng xử lý nghiệp vụ** | 1\.	Truy cập vào chức năng Xem lịch phân công 2\.	Hệ thống đưa ra lịch đã phân công |
| **Luồng ngoại lệ** |   |
| **Quy tắc nghiệp vụ** | \-   	Chỉ hiển thị các lịch dẫn đoàn từ thời điểm hiện tại trở đi và lịch sử trong một khoảng thời gian gần nhất (ví dụ trong đợt kiến tập hiện hành) để tránh quá tải dữ liệu |

 

21\. **Xem thông báo (Giảng viên, sinh viên)**

 

| Tên chức năng | Xem thông báo |
| :---- | :---- |
| **Mô tả** | Dùng để xem thông báo từ phía khoa |
| **Actor** | Giảng viên, sinh viên |
| **Tiền điều kiện** | \-   	Khoa thực hiện tạo thông báo mới \-   	Người dùng đã đăng nhập vào trong hệ thống |
| **Luồng xử lý nghiệp vụ** | 1\.	Hệ thống tự động gửi thông báo nhắc nhở 2\.	Thực hiện chức năng Xem thông báo 3\.	Nhấn vào thông báo để xem chi tiết thông báo |
| **Luồng ngoại lệ** | \-   	Có chức năng tải khi có file đính kèm trong thông báo |
| **Quy tắc nghiệp vụ** | \-   	Chỉ hiển thị thông báo có đối tượng nhận trùng khớp với Khóa/ Đợt kiến tập của người dùng \-   	Đánh dấu trạng thái đã đọc/chưa đọc cho từng thông báo theo từng người dùng |

 

22\. **Điểm danh sinh viên**

 

| Tên chức năng | Điểm danh sinh viên |
| :---- | :---- |
| **Mô tả** | Dùng để điểm danh sinh viên số sinh viên tham gia tại nhà máy hoặc qua nền tảng trực tuyến, do GV dẫn đoàn được phân công cho chuyến đó thực hiện |
| **Actor** | Giảng viên |
| **Tiền điều kiện** | \-   	Giảng viên được phân công dẫn đoàn và có lịch dẫn đoàn \-   	Giảng viên phải đăng nhập vào trong hệ thống |
| **Luồng xử lý nghiệp vụ** | 1\.	Truy cập vào chức năng Điểm danh sinh viên 2\.	Hệ thống hiển thị danh sách các đoàn dẫn 3\.	Chọn đoàn dẫn hiện tại 4\.	Hệ thống hiển thị thông tin danh sách sinh viên có trong đoàn được dẫn 5\.	Thực hiện điểm danh sinh viên 6\.	Thực hiện chức năng xác nhận để lưu danh sách |
| **Luồng ngoại lệ** | \-   	Không được phép xác nhận khi chưa điểm danh hết sinh viên \-   	Chuyến tự do dùng Giấy xác nhận tham quan thay thế cho điểm danh |
| **Quy tắc nghiệp vụ** | \-   	Kết quả điểm danh 'Có mặt' là điều kiện bắt buộc để sinh viên được phép nộp báo cáo cho chuyến tương ứng \-   	Danh sách điểm danh bị khóa sau khi GV dẫn đoàn xác nhận, trừ khi Quản lý khoa can thiệp chỉnh sửa |

 

23\. **Lịch trình và thông tin đoàn**

 

| Tên chức năng | Lịch trình và thông tin đoàn |
| :---- | :---- |
| **Mô tả** | Hiển thị lịch trình và chuyến tham quan kiến tập |
| **Actor** | Sinh viên, giảng viên |
| **Tiền điều kiện** | \-   	Đã có danh sách được phân công tham quan nhà máy |
| **Luồng xử lý nghiệp vụ** | 1\.	Truy cập vào chức năng Lịch trình 2\.	Hệ thống hiển thị lịch trình các chuyến tham quan diễn ra trong tuần và thông tin tóm tắt 3\.	Chọn vào lịch hiển thị 4\.	Hệ thống hiển thị thông tin liên quan và danh sách sinh viên tham gia |
| **Luồng ngoại lệ** | \-   	Không được phép xác nhận khi chưa điểm danh hết sinh viên \-   	Nếu người dùng chưa có chuyến tham quan nào được phân công/đăng ký, hệ thống hiển thị 'Bạn chưa có lịch trình tham quan nào' \-   	Nếu chuyến đang xem bị khoa cập nhật (đổi giờ, hủy), hệ thống cảnh báo và tự động tải lại thông tin mới nhất |
| **Quy tắc nghiệp vụ** | \-   	Chỉ hiển thị thông tin đoàn mà người dùng có liên quan (là thành viên đoàn hoặc GV giảng viên dẫn đoàn được phân công) để đảm bảo quyền riêng tư dữ liệu |

 

**Module 5: Nộp, Đánh giá, Chấm điểm**

24\. **Quản lý Hội đồng & Điểm báo cáo TQNM**

 

| Tên chức năng | Quản lý Hội đồng & Điểm báo cáo TQNM |
| :---- | :---- |
| **Mô tả** | Thành lập hội đồng chấm báo cáo Kiến tập và ghi nhận điểm phần trình bày báo cáo TQNM — cấu phần chiếm 40% điểm mỗi chuyến tham quan theo quy định của khoa |
| **Actor** | Quản lý khoa: Lập hội đồng Giảng viên: Hội đồng chấm thi |
| **Tiền điều kiện** | \-   	Sinh viên đã hoàn thành đủ 3 chuyến tham quan hợp lệ tại 3 nhà máy khác nhau, đã nộp đủ bài thu hoạch cho các chuyến đó và đã được GVHD chấm điểm \-   	Sinh viên đã xác nhận chọn xong bộ 3 chuyến báo cáo chính thức (hoặc hệ thống đã tự động chọn theo cơ chế mặc định nếu SV không chọn trước hạn) |
| **Luồng xử lý nghiệp vụ** | 1\.	Quản lý khoa lập lịch buổi báo cáo và phân công các giảng viên tham gia hội đồng cho từng buổi/nhóm sinh viên. 2\.	Đến ngày báo cáo, hội đồng nghe sinh viên trình bày báo cáo cho từng nhà máy đã tham quan. 3\.	Từng thành viên hội đồng nhập điểm báo cáo TQNM cho từng nhà máy vào hệ thống. 4\.	Hệ thống tổng hợp điểm báo cáo TQNM và chuyển vào công thức tính điểm chuyến tham quan |
| **Luồng ngoại lệ** | \-   	Sinh viên vắng mặt buổi báo cáo không có lý do được duyệt, điểm báo cáo TQNM \= 0, học phần không đạt |
| **Quy tắc nghiệp vụ** | \-   	Điểm báo cáo TQNM là điểm trung bình của các thành viên hội đồng chấm độc lập \-   	Điểm này chiếm 40% trọng số điểm của chuyến tham quan tương ứng, theo đúng quy định đánh giá học phần Kiến tập của khoa \-   	Không thể chỉnh sửa điểm sau khi buổi báo cáo kết thúc và Quản lý khoa đã khóa điểm |

 

25\. **Đánh giá nội dung bài thu hoạch**

 

| Tên chức năng | Đánh giá nội dung bài thu hoạch |
| :---- | :---- |
| **Mô tả** | Dùng để chấm điểm bài thu hoạch kiến tập cho sinh viên |
| **Actor** | Giảng viên (Giảng viên hướng dẫn) |
| **Tiền điều kiện** | \-   	Sinh viên đã thực hiện nộp bài thu hoạch |
| **Luồng xử lý nghiệp vụ** | 5\.	Thực hiện chức năng Đánh giá bài thu hoạch 6\.	Hệ thống đưa danh sách sinh viên mà giảng viên hướng dẫn 7\.	Chọn sinh viên cần chấm điểm 8\.	Hệ thống đưa danh sách bài bài làm của sinh viên 9\.	Hệ thống hiển thị bài làm 10\. Chọn chức năng tự động chấm điểm 11\. Hệ thống đưa ra mức điểm gợi ý, và giải thích lý do có mức điểm như vậy 12\. Chọn chức năng Xác nhận 13\. Hệ thống sẽ lấy điểm gợi ý và để lưu vào cơ sở dữ liệu |
| **Luồng ngoại lệ** | \-   	Giảng viên có thể chỉnh sửa điểm cho bài thu hoạch |
| **Quy tắc nghiệp vụ** | \-   	Bài thu hoạch hợp lệ phải có đủ 3 nội dung bắt buộc: (1) giới thiệu tổng quan nhà máy, (2) thuyết minh quy trình công nghệ sản xuất, (3) đánh giá thực trạng điều kiện đảm bảo VSATTP; mô hình AI và GVHD chấm điểm dựa trên tiêu chí của 3 phần này \-   	Điểm bài thu hoạch chiếm 30% trọng số điểm của chuyến tham quan tương ứng (không phải điểm tổng kết toàn học phần) \-   	GVHD luôn có quyền và trách nhiệm chỉnh sửa điểm do AI gợi ý; hệ thống lưu lại đồng thời điểm AI đề xuất ban đầu và điểm GVHD quyết định cuối cùng để phục vụ đối chiếu và cải thiện mô hình về sau |

26\. **Quản lý điểm chuẩn bị và điểm cộng**

 

| Tên chức năng | Quản lý điểm chuẩn bị và điểm cộng |
| :---- | :---- |
| **Mô tả** | Dùng để ghi nhận điểm chuẩn bị và điểm cộng cho sinh viên. Tất cả các hình thức GV dẫn đoàn nhập điểm chuẩn bị lấy từ bài kiểm tra tổ chức bằng công cụ ngoài hệ thống và ghi điểm cộng. |
| **Actor** | Giảng viên dẫn đoàn |
| **Tiền điều kiện** | \-   	Sinh viên có mặt trong danh sách chuyến tham quan kiến tập \-   	Giảng viên đã tổ chức và có sẵn kết quả bài kiểm tra trắc nghiệm từ công cụ ngoài hệ thống \-   	Đối với sinh viên tự do: sinh viên đã hoàn thành chuyến và chưa đến hạn nộp báo cáo |
| **Luồng xử lý nghiệp vụ** | 1\.	Chọn chức năng Điểm chuẩn bị và điểm cộng 2\.	Thực hiện chỉnh sửa điểm chuẩn bị và điểm cộng 3\.	Nhấn Nộp điểm để gửi điểm |
| **Luồng ngoại lệ** | \-   	Không thể chỉnh sửa điểm sau khi quản lý khoa nhấn khóa điểm \-   	Đối với sinh viên tự do: Bài chuẩn bị được GVHD cung cấp và nhập điểm |
| **Quy tắc nghiệp vụ** | \-   	Điểm chuẩn bị chiếm 30% trọng số điểm của chuyến; là điểm bài kiểm tra trắc nghiệm kiến thức về công ty \-   	Điểm cộng (điểm thưởng giao lưu đặt câu hỏi): 0,5 điểm/câu hỏi đúng trọng tâm, tối đa 1 điểm/nhà máy; do GIẢNG VIÊN DẪN ĐOÀN ghi nhận trong lúc tham quan (không phải GVHD) — hệ thống cần giới hạn quyền nhập điểm này đúng theo vai trò GV dẫn đoàn của chuyến đó \-   	Không thể chỉnh sửa điểm sau khi Quản lý khoa nhấn khóa điểm |

 

27\. **Quản lý kết quả kiến tập**

 

| Tên chức năng | Quản lý kết quả kiến tập |
| :---- | :---- |
| **Mô tả** | Dùng để xem thông tin thông tin tất cả điểm số, số lượng đi tham quan nhà máy của sinh viên |
| **Actor** | Giảng viên, Quản lý khoa |
| **Tiền điều kiện** | \-   	Giảng viên đã chấm điểm \-   	Sinh viên đã/đang tham quan kiến tập \-   	Chuyến tham quan của sinh viên không được quá 18 tháng \-   	Hội đồng đã hoàn tất chấm điểm báo cáo TQNM cho sinh viên |
| **Luồng xử lý nghiệp vụ** | 1\.	Truy cập vào chức năng quản lý kiến tập 2\.	Chọn đợt kiến tập 3\.	Hệ thống sẽ trả về ma trận thông tin giữa nhà máy và sinh viên trong đợt kiến tập, hiển thị đủ 4 thành phần: điểm chuẩn bị, điểm bài thu hoạch, điểm báo cáo TQNM cho từng nhà máy 4\.	thực hiện chức năng xác nhận để khóa điểm |
| **Luồng ngoại lệ** | \-   	Đối với giảng viên: \-   	Không thể chỉnh sửa điểm sau khi quản lý khoa nhấn khóa điểm \-   	Chức năng khóa điểm đổi thành chức năng nộp điểm \-   	Đối với quản lý khoa: \-   	Không thể thu hồi quyền sau khi nhấn khóa điểm \-   	Không thể khóa điểm trước thời gian kết thúc \-   	Nếu sinh viên chưa đăng ký thì không đánh kết quả \-   	Không thể khóa điểm nếu hội đồng chưa chấm xong điểm báo cáo TQNM cho sinh viên đó |
| **Quy tắc nghiệp vụ** | \-   	Công thức điểm mỗi chuyến (nhà máy) \= 30% × điểm chuẩn bị \+ 30% × điểm bài thu hoạch \+ 40% × điểm báo cáo TQNM \+ điểm thưởng \-   	Điểm tổng kết học phần \= trung bình cộng điểm của 3 chuyến tham quan hợp lệ \-   	Nếu đến thời điểm khóa điểm sinh viên chưa có đủ 3 chuyến hợp lệ, học phần tự động được đánh 'Không đạt/Chưa hoàn thành', không tính điểm tổng kết \-   	Không thu hồi quyền sau khi khóa điểm; không khóa điểm trước thời gian kết thúc đợt; sinh viên chưa đăng ký thì không đánh kết quả |

28\. **Chức năng xem điểm**

 

| Tên chức năng | Xem điểm |
| :---- | :---- |
| **Mô tả** | Dùng để xem điểm số của các đợt kiến tập và báo cáo kiến tập |
| **Actor** | Sinh viên |
| **Tiền điều kiện** | \-   	Khoa đã chốt danh sách điểm \-   	Sinh viên đã đăng nhập vào trong hệ thống |
| **Luồng xử lý nghiệp vụ** | 1\.	Thực hiện chức năng Xem kết quả 2\.	Hệ thống hiển thị danh sách các nhà máy, điểm của từng nhà máy (Điểm chuẩn bị, điểm bài báo cáo, Điểm vấn đáp) |
| **Luồng ngoại lệ** |   |
| **Quy tắc nghiệp vụ** | \-   	Sinh viên chỉ xem được điểm sau khi Quản lý khoa đã khóa điểm chính thức, kể cả khi GVHD/Hội đồng đã chấm xong nhưng chưa khóa |

29\. **Chức năng nộp bài thu hoạch**

 

| Tên chức năng | Nộp bài thu hoạch |
| :---- | :---- |
| **Mô tả** | Dùng để nộp bài thu hoạch sau chuyến tham quan kiến tập |
| **Actor** | Sinh viên |
| **Tiền điều kiện** | \-   	Sinh viên đã đăng ký và tham gia chuyến tham quan kiến tập |
| **Luồng xử lý nghiệp vụ** | 1\.	Truy cập vào chức năng Nộp báo cáo 2\.	Chọn chuyến tham quan kiến tập 3\.	Chọn file nộp 4\.	Hệ thống tự động nhận diện và viết lại nội dung 5\.	Sinh viên chỉnh sửa và nội dung nhận diện sai 6\.	Thực hiện chức năng Nộp 7\.	Sinh viên có thể chọn bài thu hoạch để báo cáo với hội đồng (2 nhà máy trực tiếp \+ 1 nhà máy trực tuyến) 8\.	Thực hiện chức năng xác nhận |
| **Luồng ngoại lệ** | \-   	Nếu trong thời gian nộp sinh viên có xem, chỉnh sửa và nộp lại nội dung báo cáo \-   	Sinh viên không thể thực hiện chỉnh sửa sau 10 ngày kể từ ngày tham quan \-   	Sinh viên không thể nộp bài sau 21 ngày kể từ ngày tham quan \-   	Đối với sinh viên tự do: Phải được khai báo chuyến tham quan tại chức năng Đăng ký kiến tập để được khởi tạo chức năng Nộp báo cáo \-   	Không cho xác nhận nếu lựa chọn không đủ tối thiểu 2 trực tiếp \+ 1 trực tuyến \-   	Không cho đổi lựa chọn sau khi khoa đã lên lịch buổi báo cáo Hội đồng \-   	Nếu hòa điểm, ưu tiên chuyến có ngày tham quan sớm hơn |
| **Quy tắc nghiệp vụ** | \-   	File nộp bắt buộc định dạng .pdf, dung lượng ≤ 10MB; hệ thống tự sinh tên file theo đúng cú pháp MSSV-Họ và tên-BCKT\<tên nhà máy rút gọn\> thay vì để sinh viên tự đặt tên, nhằm tránh sai cú pháp \-   	Sinh viên được sửa/nộp lại trong vòng 10 ngày kể từ ngày tham quan mà không bị trừ điểm; nộp trong khoảng 11–21 ngày bị trừ 1 điểm trên thang điểm của chuyến đó; sau 21 ngày không nộp thì chuyến đó không được tính hoàn thành và sinh viên phải tham quan lại \-   	Đối với chuyến tự do: bắt buộc đính kèm Giấy xác nhận tham quan có dấu xác nhận của nhà máy; thiếu giấy xác nhận thì hồ sơ ở trạng thái 'Chờ bổ sung', chưa được tính hoàn thành \-   	Mỗi lần nộp là một phiên bản mới ghi đè bản trước trong cùng chuyến tham quan \-   	Chỉ được chọn 3 nhà máy (2 nhà máy trực tiếp \+ 1 nhà máy trực tuyến) |

 

      	**Module 6: Tài chính & Báo cáo (Web)**

30\. **Thanh toán lệ phí kiến tập**

 

| Tên chức năng | Thanh toán lệ phí kiến tập |
| :---- | :---- |
| **Mô tả** | Dùng để thanh toán các lệ phí liên quan cho học phần kiến tập |
| **Actor** | Sinh viên |
| **Tiền điều kiện** | \-   	Sinh viên đã được duyệt vào trong danh sách kiến tập \-   	Sinh viên đã đăng nhập vào trong hệ thống |
| **Luồng xử lý nghiệp vụ** | 1\.	Truy cập vào chức năng thanh toán lệ phí 2\.	Hệ thống hiển thị các mục lệ phí 3\.	Sinh viên thực hiện chức năng thanh toán 4\.	Hệ thống hiển thị mã QR thanh toán 5\.	Sinh viên thực hiện thanh toán |
| **Luồng ngoại lệ** | \-   	Không thể thực hiện chức năng thanh toán sau khi đã quá hạn \-   	Khi phiếu bị đánh dấu 'Vi phạm thanh toán' do trễ hạn/sai nội dung, sinh viên được truy cập ngay chức năng 'Gửi yêu cầu hoàn phí' từ màn hình này |
| **Quy tắc nghiệp vụ** | \-   	Hệ thống sinh sẵn nội dung/cú pháp chuyển khoản riêng cho từng sinh viên/chuyến (ví dụ ghép MSSV và mã chuyến) để đối chiếu tự động, thay vì để sinh viên tự nhập nội dung dễ sai \-   	Đóng trễ hạn so với hạn riêng của từng chuyến hệ thống tự động đánh dấu 'Vi phạm thanh toán', loại khỏi danh sách tham quan và kích hoạt hình phạt 'mất quyền ưu tiên 5 chuyến tiếp theo' \-   	Sinh viên tự ý bỏ chuyến dù đã đóng phí đúng hạn không được hoàn phí và cũng bị đưa vào danh sách mất quyền ưu tiên 5 chuyến tiếp theo |

 

31\. **Quản lý lệ phí kiến tập**

 

| Tên chức năng | Quản lý lệ phí kiến tập |
| :---- | :---- |
| **Mô tả** | Dùng để kiểm soát và quản lý danh sách sinh viên đóng lệ phí cho chuyến tham quan |
| **Actor** | Quản lý khoa |
| **Tiền điều kiện** | \-   	Có danh sách sinh viên đã đóng lệ phí theo mẫu hệ thống yêu cầu |
| **Luồng xử lý nghiệp vụ** | 1\.	Truy cập vào chức năng quản lý lệ phí 2\.	Chọn chức năng Tải danh sách 3\.	Chọn file danh sách sinh viên đã đóng lệ phí 4\.	Hệ thống hiển thị danh sách và thông báo số lượng được cập nhật 5\.	Đối chiếu dữ liệu và thực hiện chức năng xác nhận 6\.	Hệ thống cập nhật trạng thái cho sinh viên |
| **Luồng ngoại lệ** | \-   	Thông báo lỗi khi file không đúng định dạng và mẫu yêu cầu |
| **Quy tắc nghiệp vụ** | \-   	Thông báo lỗi khi file danh sách sinh viên đã đóng phí không đúng định dạng/mẫu yêu cầu |

 

32\. **Gửi yêu cầu hoàn phí**

 

| Tên chức năng | Gửi yêu cầu hoàn phí |
| :---- | :---- |
| **Mô tả** | Cho phép sinh viên gửi yêu cầu hoàn lại lệ phí đã đóng khi bị loại khỏi danh sách tham quan do đóng phí sai quy định (trễ hạn/sai nội dung), kèm minh chứng liên quan |
| **Actor** | Sinh viên |
| **Tiền điều kiện** | \-   	Sinh viên có phiếu thanh toán ở trạng thái "Vi phạm thanh toán" do trễ hạn/sai nội dung, và chưa từng gửi yêu cầu hoàn phí cho chuyến đó |
| **Luồng xử lý nghiệp vụ** | 1\.	Sinh viên truy cập chức năng Yêu cầu hoàn phí 2\.	Chọn chuyến bị loại cần xin hoàn phí 3\.	Nhập lý do và đính kèm minh chứng (ảnh biên lai chuyển khoản) 4\.	Nhập số tài khoản ngân hàng nhận hoàn tiền 5\.	Nhấn Gửi yêu cầu 6\.	Hệ thống chuyển trạng thái phiếu thanh toán thành "Chờ duyệt hoàn phí" |
| **Luồng ngoại lệ** | \-   	Không thể gửi yêu cầu cho chuyến bị loại do "Không đóng phí" hoặc "Bỏ chuyến không lý do" \-   	Không thể gửi 2 yêu cầu cho cùng 1 chuyến; Thiếu minh chứng bắt buộc |
| **Quy tắc nghiệp vụ** | \-   	Chỉ áp dụng cho trạng thái "Vi phạm thanh toán" do trễ hạn/sai nội dung; Mỗi chuyến chỉ được gửi 1 yêu cầu |

 

33\. **Duyệt hoàn phí**

 

| Tên chức năng | Duyệt yêu cầu hoàn phí |
| :---- | :---- |
| **Mô tả** | Cho phép Quản lý khoa xem xét và phê duyệt/từ chối yêu cầu hoàn phí do sinh viên gửi |
| **Actor** | Sinh viên |
| **Tiền điều kiện** | \-   	Có ít nhất 1 yêu cầu ở trạng thái "Chờ duyệt hoàn phí" \-   	Đã nhận đơn giấy tương ứng tại VPK |
| **Luồng xử lý nghiệp vụ** | 1\.	Truy cập chức năng Duyệt hoàn phí 2\.	Hệ thống hiển thị danh sách yêu cầu đang chờ kèm minh chứng 3\.	Chọn Duyệt hoặc Từ chối (nhập lý do nếu từ chối) 4\.	Xác nhận |
| **Luồng ngoại lệ** | \-   	Nếu Từ chối: hệ thống trả trạng thái phiếu thanh toán về "Vi phạm thanh toán", gửi thông báo lý do cho SV \-   	Nếu Duyệt: chuyển sang "Đã duyệt hoàn phí – Chờ chi tiền |
| **Quy tắc nghiệp vụ** | \-   	Quản lý khoa cập nhật thủ công sang "Đã hoàn phí" sau khi xác nhận đã chuyển tiền \-   	Không thể duyệt lại yêu cầu đã Từ chối/đã Duyệt |

 

34\. **Báo cáo thống kê**

 

| Tên chức năng | Báo cáo thống kê |
| :---- | :---- |
| **Mô tả** | Dùng để thống kê dữ liệu theo các mục |
| **Actor** | Quản lý khoa |
| **Tiền điều kiện** | \-   	Đã đăng nhập vào hệ thống |
| **Luồng xử lý nghiệp vụ** | 1\.	Truy cập vào chức năng Thống kê 2\.	Chọn mục thống kê theo yêu cầu 3\.	Thực hiện chức năng tải danh sách 4\.	Danh sách danh mục thống kê được tải xuống máy |
| **Luồng ngoại lệ** | \-   	Thông báo không thể tải khi không có danh sách |
| **Quy tắc nghiệp vụ** | \-   	Danh mục báo cáo tối thiểu cần có: tổng hợp dữ liệu tham quan từng sinh viên trong năm học; danh sách sinh viên đã tham quan; danh sách sinh viên chưa tham quan; danh sách sinh viên đủ điều kiện báo cáo (đã đủ 3 chuyến hợp lệ); danh sách sinh viên không thực hiện (quá hạn không hoàn thành); danh sách sinh viên đạt/không đạt; danh sách tổng hợp dữ liệu tham quan theo năm học \-   	Mỗi báo cáo cần hỗ trợ bộ lọc theo Khóa, Năm học, Đợt kiến tập và Lớp |

 

**Thiết kế cơ sở dữ liệu**

**1\. Bảng: NamHoc (Danh mục năm học)**

 

| STT | Tên cột | Kiểu dữ liệu | Mô tả |
| :---: | ----- | :---: | ----- |
| 1 | id | INT | ID tự tăng (Khóa chính), mã định danh duy nhất của năm học. |
| 2 | ten\_nam\_hoc | NVARCHAR(20) | Tên năm học, giá trị duy nhất và không được để trống (vd: '2025-2026'). |
| 3 | ngay\_bat\_dau | DATE | Ngày bắt đầu năm học. |
| 4 | ngay\_ket\_thuc | DATE | Ngày kết thúc năm học (phải lớn hơn ngày bắt đầu). |

 

**2\. Bảng: HocKy (Danh mục học kỳ)**

 

| STT | Tên cột | Kiểu dữ liệu | Mô tả |
| :---: | ----- | :---: | ----- |
| 1 | id | INT | ID tự tăng (Khóa chính), mã định danh của học kỳ. |
| 2 | nam\_hoc\_id | INT | ID năm học (Khóa ngoại liên kết tới bảng NamHoc). |
| 3 | ten\_hoc\_ky | NVARCHAR(20) | Tên học kỳ (vd: 'Học kỳ 1', 'Học kỳ 2'). |
| 4 | ngay\_bat\_dau | DATE | Ngày bắt đầu học kỳ. |
| 5 | ngay\_ket\_thuc | DATE | Ngày kết thúc học kỳ (phải lớn hơn ngày bắt đầu). |

 

**3\. Bảng: Khoa (Danh mục khóa học của sinh viên)**

 

| STT | Tên cột | Kiểu dữ liệu | Mô tả |
| :---: | ----- | :---: | ----- |
| 1 | id | INT | ID tự tăng (Khóa chính), mã định danh của khóa học. |
| 2 | ten\_khoa | NVARCHAR(20) | Tên khóa học, giá trị duy nhất (vd: '14ĐHTP', '13ĐHTP'...). |
| 3 | nam\_nhap\_hoc | INT | Năm nhập học của khóa tương ứng. |

 

**4\. Bảng: TaiKhoan (Quản lý tài khoản đăng nhập hệ thống)**

 

| STT | Tên cột | Kiểu dữ liệu | Mô tả |
| :---: | ----- | :---: | ----- |
| 1 | id | INT | ID tự tăng (Khóa chính), mã định danh tài khoản. |
| 2 | ten\_dang\_nhap | NVARCHAR(50) | Tên đăng nhập hệ thống (duy nhất). |
| 3 | mat\_khau\_hash | NVARCHAR(255) | Chuỗi mật khẩu đã được mã hóa. |
| 4 | vai\_tro | NVARCHAR(20) | Vai trò người dùng (QuanLyKhoa, GiangVien, SinhVien). |
| 5 | trang\_thai | NVARCHAR(20) | Trạng thái tài khoản (HoatDong, KhoaTaiKhoan). Mặc định: HoatDong. |
| 6 | phai\_doi\_mat\_khau | BIT | Cờ ép buộc người dùng đổi mật khẩu ở lần đăng nhập đầu tiên (1: Có, 0: Không). Mặc định: 1\. |
| 7 | lan\_dang\_nhap\_cuoi | DATETIME2 | Thời điểm cuối cùng tài khoản đăng nhập vào hệ thống. |
| 8 | ngay\_tao | DATETIME2 | Ngày giờ khởi tạo tài khoản trên hệ thống. |

 

**5\. Bảng: SinhVien (Thông tin chi tiết sinh viên)**

 

| STT | Tên cột | Kiểu dữ liệu | Mô tả |
| :---: | ----- | :---: | ----- |
| 1 | id | INT | ID tự tăng (Khóa chính), định danh sinh viên. |
| 2 | mssv | NVARCHAR(15) | Mã số sinh viên (duy nhất). |
| 3 | ho\_ten | NVARCHAR(100) | Họ và tên đầy đủ của sinh viên. |
| 4 | taikhoan\_id | INT | ID tài khoản liên kết (Khóa ngoại liên kết bảng TaiKhoan, duy nhất). |
| 5 | khoa\_id | INT | ID khóa học (Khóa ngoại liên kết bảng Khoa). |
| 6 | ten\_lop | NVARCHAR(20) | Tên lớp sinh hoạt của sinh viên. |
| 7 | email | NVARCHAR(100) | Địa chỉ thư điện tử cá nhân hoặc của trường cấp. |
| 8 | sdt | NVARCHAR(15) | Số điện thoại liên lạc. |

 

**6\. Bảng: GiangVien (Thông tin chi tiết giảng viên)**

 

| STT | Tên cột | Kiểu dữ liệu | Mô tả |
| :---: | ----- | :---: | ----- |
| 1 | id | INT | ID tự tăng (Khóa chính), định danh giảng viên. |
| 2 | ma\_gv | NVARCHAR(15) | Mã giảng viên (duy nhất). |
| 3 | ho\_ten | NVARCHAR(100) | Họ và tên đầy đủ của giảng viên. |
| 4 | taikhoan\_id | INT | ID tài khoản liên kết (Khóa ngoại liên kết bảng TaiKhoan, duy nhất). |
| 5 | email | NVARCHAR(100) | Địa chỉ thư điện tử của giảng viên. |
| 6 | sdt | NVARCHAR(15) | Số điện thoại liên lạc. |
| 7 | du\_dk\_hoi\_dong | BIT | Đủ điều kiện tham gia hội đồng chấm báo cáo (1: Đủ, 0: Không). Mặc định: 0\. |
| 8 | so\_sv\_toi\_da\_huong\_dan | INT | Hạn ngạch (quota) số lượng sinh viên tối đa được phép hướng dẫn trong đợt. |

 

**7\. Bảng: NhaMay (Danh sách doanh nghiệp/nhà máy đối tác)**

 

| STT | Tên cột | Kiểu dữ liệu | Mô tả |
| :---: | ----- | :---: | ----- |
| 1 | id | INT | ID tự tăng (Khóa chính), định danh nhà máy. |
| 2 | ten\_nha\_may | NVARCHAR(150) | Tên đầy đủ của nhà máy/doanh nghiệp. |
| 3 | dia\_chi | NVARCHAR(255) | Địa chỉ trụ sở chính/nhà xưởng. |
| 4 | nhom\_nganh | NVARCHAR(50) | Nhóm ngành hoạt động (vd: 'Đồ uống', 'Sữa \- dầu \- chất béo'...). |
| 5 | ho\_tro\_truc\_tiep | BIT | Hỗ trợ tham quan/kiến tập trực tiếp tại nhà máy (1: Có, 0: Không). Mặc định: 1\. |
| 6 | ho\_tro\_truc\_tuyen | BIT | Hỗ trợ tham quan/kiến tập trực tuyến (1: Có, 0: Không). Mặc định: 0\. |
| 7 | trang\_thai | NVARCHAR(20) | Trạng thái hợp tác của nhà máy (HoatDong, NgungHopTac). Mặc định: HoatDong. |

 

**8\. Bảng: ThongBao (Quản lý các thông báo từ Khoa)**

 

| STT | Tên cột | Kiểu dữ liệu | Mô tả |
| :---: | ----- | :---: | ----- |
| 1 | id | INT | ID tự tăng (Khóa chính), định danh bài thông báo. |
| 2 | tieu\_de | NVARCHAR(255) | Tiêu đề của thông báo. |
| 3 | noi\_dung | NVARCHAR(MAX) | Nội dung chi tiết bài thông báo. |
| 4 | nguoi\_gui\_id | INT | ID tài khoản người gửi (Khóa ngoại liên kết bảng TaiKhoan). |
| 5 | khoa\_id | INT | ID khóa nhận thông báo (Khóa ngoại liên kết bảng Khoa, NULL nếu gửi toàn bộ các khóa). |
| 6 | ngay\_gui | DATETIME2 | Thời gian gửi thông báo lên hệ thống. |
| 7 | da\_chinh\_sua | BIT | Cờ đánh dấu thông báo đã bị chỉnh sửa hay chưa (1: Đã sửa, 0: Chưa sửa). |

 

**9\. Bảng: ThongBaoFile (Tệp tin đính kèm của thông báo)**

 

| STT | Tên cột | Kiểu dữ liệu | Mô tả |
| :---: | ----- | :---: | ----- |
| 1 | id | INT | ID tự tăng (Khóa chính), định danh file đính kèm. |
| 2 | thongbao\_id | INT | ID bài thông báo sở hữu tệp (Khóa ngoại liên kết bảng ThongBao). |
| 3 | ten\_file | NVARCHAR(255) | Tên của tệp tin hiển thị trên giao diện. |
| 4 | duong\_dan | NVARCHAR(500) | Đường dẫn lưu trữ vật lý của file trên máy chủ. |
| 5 | dung\_luong\_kb | INT | Dung lượng tệp đính kèm (tính bằng KB). |

 

**10\. Bảng: ThongBaoDaDoc (Theo dõi xem/đọc thông báo của người dùng)**

 

| STT | Tên cột | Kiểu dữ liệu | Mô tả |
| :---: | ----- | :---: | ----- |
| 1 | id | INT | ID tự tăng (Khóa chính), định danh lượt đọc. |
| 2 | thongbao\_id | INT | ID thông báo đã đọc (Khóa ngoại liên kết bảng ThongBao). |
| 3 | taikhoan\_id | INT | ID tài khoản người đã đọc (Khóa ngoại liên kết bảng TaiKhoan). |
| 4 | ngay\_doc | DATETIME2 | Thời điểm người dùng nhấn xem thông báo. |

 

**11\. Bảng: NhacNho (Hàng đợi nhắc nhở tự động cho sinh viên/giảng viên)**

 

| STT | Tên cột | Kiểu dữ liệu | Mô tả |
| :---: | ----- | :---: | ----- |
| 1 | id | INT | ID tự tăng (Khóa chính), định danh nhắc nhở. |
| 2 | taikhoan\_id | INT | ID tài khoản nhận tin nhắn nhắc nhở (Khóa ngoại liên kết bảng TaiKhoan). |
| 3 | loai | NVARCHAR(30) | Phân loại nhắc nhở (HanNopBaoCao, HanDongPhi, HanBaoLuu18Thang, LichDanDoan, LichBaoCaoHoiDong, LichThamQuan). |
| 4 | noi\_dung | NVARCHAR(500) | Nội dung chi tiết của nhắc nhở. |
| 5 | doi\_tuong\_id | INT | ID của thực thể liên quan (ID chuyến đi, ID hóa đơn...) phục vụ việc truy vết. |
| 6 | ngay\_du\_kien\_gui | DATETIME2 | Thời gian dự kiến gửi thông báo nhắc nhở này đi. |
| 7 | da\_gui | BIT | Cờ trạng thái đã gửi đi thành công (1: Đã gửi, 0: Chưa). |
| 8 | ngay\_gui\_thuc\_te | DATETIME2 | Thời điểm thực tế hệ thống gửi tin đi. |

 

**12\. Bảng: DotKienTap (Quản lý các đợt kiến tập chung)**

 

| STT | Tên cột | Kiểu dữ liệu | Mô tả |
| :---: | ----- | :---: | ----- |
| 1 | id | INT | ID tự tăng (Khóa chính), định danh đợt kiến tập. |
| 2 | ten\_dot | NVARCHAR(150) | Tên đợt kiến tập (duy nhất kết hợp với năm học & học kỳ). |
| 3 | nam\_hoc\_id | INT | ID năm học diễn ra đợt kiến tập (Khóa ngoại liên kết bảng NamHoc). |
| 4 | hoc\_ky\_id | INT | ID học kỳ diễn ra đợt kiến tập (Khóa ngoại liên kết bảng HocKy). |
| 5 | ngay\_bat\_dau | DATE | Ngày bắt đầu triển khai đợt kiến tập. |
| 6 | ngay\_ket\_thuc | DATE | Ngày kết thúc đợt kiến tập (phải lớn hơn ngày bắt đầu). |
| 7 | trang\_thai | NVARCHAR(20) | Trạng thái hiện tại của đợt (Nhap, DangTrienKhai, DaKetThuc, DaKhoa, DaHuy). Mặc định: Nhap. |

 

**13\. Bảng: LichKienTap (Lịch trình chi tiết áp dụng riêng theo từng khóa học)**

 

| STT | Tên cột | Kiểu dữ liệu | Mô tả |
| :---: | ----- | :---: | ----- |
| 1 | id | INT | ID tự tăng (Khóa chính), định danh lịch kiến tập. |
| 2 | dot\_kien\_tap\_id | INT | ID đợt kiến tập chứa lịch này (Khóa ngoại liên kết bảng DotKienTap). |
| 3 | khoa\_id | INT | ID khoa áp dụng lịch (Khóa ngoại liên kết bảng Khoa). |
| 4 | ten\_lich | NVARCHAR(150) | Tên gọi mô tả lịch kiến tập cụ thể. |
| 5 | tg\_mo\_dang\_ky\_tu | DATETIME2 | Thời điểm bắt đầu mở cổng đăng ký chuyến tham quan. |
| 6 | tg\_mo\_dang\_ky\_den | DATETIME2 | Thời điểm kết thúc nhận đăng ký. |
| 7 | tg\_dien\_ra\_tu | DATE | Ngày bắt đầu tổ chức đi tham quan thực tế. |
| 8 | tg\_dien\_ra\_den | DATE | Ngày kết thúc tổ chức đi tham quan thực tế. |
| 9 | han\_chot\_nop\_bao\_cao | DATETIME2 | Hạn chót để sinh viên nộp file bài thu hoạch. |
| 10 | han\_chot\_diem | DATETIME2 | Hạn cuối để giảng viên hoàn thành chấm và chốt điểm trên hệ thống. |
| 11 | trang\_thai | NVARCHAR(20) | Trạng thái của lịch (Nhap, MoDangKy, DangDienRa, DaKetThuc, DaKhoa). Mặc định: Nhap. |

 

**14\. Bảng: LichKienTap\_SinhVien (Danh sách sinh viên đăng ký học phần)**

 

| STT | Tên cột | Kiểu dữ liệu | Mô tả |
| :---: | ----- | :---: | ----- |
| 1 | id | INT | ID tự tăng (Khóa chính), định danh lượt đăng ký học phần. |
| 2 | lich\_kien\_tap\_id | INT | ID lịch kiến tập tương ứng (Khóa ngoại liên kết bảng LichKienTap). |
| 3 | sinh\_vien\_id | INT | ID sinh viên tham gia học phần (Khóa ngoại liên kết bảng SinhVien). |
| 4 | lan\_dang\_ky | INT | Số lần đăng ký học phần kiến tập của sinh viên này (lần 1, học lại lần 2...). Mặc định: 1\. |
| 5 | trang\_thai | NVARCHAR(20) | Trạng thái thực hiện học phần (DangThucHien, Dat, KhongDat). Mặc định: DangThucHien. |
| 6 | ngay\_them | DATETIME2 | Ngày sinh viên được import/thêm vào danh sách đợt. |

 

**15\. Bảng: ChuyenThamQuan (Quản lý các chuyến đi thực tế nhà máy)**

 

| STT | Tên cột | Kiểu dữ liệu | Mô tả |
| :---: | ----- | :---: | ----- |
| 1 | id | INT | ID tự tăng (Khóa chính), định danh chuyến đi. |
| 2 | nha\_may\_id | INT | ID nhà máy điểm đến của chuyến (Khóa ngoại liên kết bảng NhaMay). |
| 3 | lich\_kien\_tap\_id | INT | ID lịch kiến tập chứa chuyến (Khóa ngoại liên kết bảng LichKienTap). |
| 4 | ngay\_tham\_quan | DATE | Ngày tổ chức khởi hành tham quan. |
| 5 | gio\_bat\_dau | TIME | Giờ xuất phát tham quan. |
| 6 | gio\_ket\_thuc | TIME | Giờ kết thúc tham quan (phải lớn hơn giờ bắt đầu). |
| 7 | hinh\_thuc | NVARCHAR(15) | Hình thức tham quan (TrucTiep hoặc TrucTuyen). |
| 8 | cach\_to\_chuc | NVARCHAR(15) | Cách thức tổ chức (DoKhoaToChuc hoặc TuDo). Mặc định: DoKhoaToChuc. |
| 9 | suc\_chua | INT | Số lượng giới hạn sinh viên được tham gia tối đa của chuyến. |
| 10 | trang\_thai | NVARCHAR(20) | Trạng thái chuyến (Nhap, MoDangKy, DaChotDanhSach, DaDienRa, DaHuy). Mặc định: Nhap. |
| 11 | de\_xuat\_boi\_id | INT | ID sinh viên đề xuất chuyến tự đi kiến tập (NULL nếu do Khoa tổ chức; Khóa ngoại liên kết SinhVien). |
| 12 | trang\_thai\_duyet\_tudo | NVARCHAR(15) | Kết quả duyệt đề xuất tự do của Khoa (ChoDuyet, DaDuyet, TuChoi). |
| 13 | nguoi\_duyet\_id | INT | ID quản lý duyệt đơn đề xuất chuyến đi tự do (Khóa ngoại liên kết TaiKhoan). |
| 14 | ngay\_duyet | DATETIME2 | Thời gian phê duyệt đơn đề xuất chuyến tự do. |

 

**16\. Bảng: ChuyenThamQuan\_GiangVienDanDoan (Phân công GV dẫn đoàn cho chuyến)**

 

| STT | Tên cột | Kiểu dữ liệu | Mô tả |
| :---: | ----- | :---: | ----- |
| 1 | id | INT | ID tự tăng (Khóa chính), định danh phân công. |
| 2 | chuyen\_tham\_quan\_id | INT | ID chuyến đi tham quan (Khóa ngoại liên kết bảng ChuyenThamQuan). |
| 3 | giang\_vien\_id | INT | ID giảng viên dẫn đoàn (Khóa ngoại liên kết bảng GiangVien). |
| 4 | la\_truong\_doan | BIT | Cờ xác định giảng viên này có phải trưởng đoàn chấm điểm cộng hay không. Mặc định: 1\. |

 

**17\. Bảng: PhieuDangKy (Phiếu đăng ký chuyến đi của sinh viên)**

 

| STT | Tên cột | Kiểu dữ liệu | Mô tả |
| :---: | ----- | :---: | ----- |
| 1 | id | INT | ID tự tăng (Khóa chính), định danh phiếu đăng ký. |
| 2 | sinh\_vien\_id | INT | ID sinh viên đăng ký (Khóa ngoại liên kết bảng SinhVien). |
| 3 | chuyen\_tham\_quan\_id | INT | ID chuyến đi tham quan (Khóa ngoại liên kết bảng ChuyenThamQuan). |
| 4 | ngay\_dang\_ky | DATETIME2 | Ngày giờ sinh viên gửi phiếu đăng ký chuyến đi. |
| 5 | trang\_thai | NVARCHAR(20) | Trạng thái phiếu đăng ký (ChoDuyet, HopLe, BiLoai, DaHuy, DaThamGia, VangMat, HoanThanh, KhongDat). Mặc định: ChoDuyet. |

 

**18\. Bảng: YeuCauHuyDangKy (Yêu cầu xin rút/hủy đăng ký chuyến đi của SV)**

 

| STT | Tên cột | Kiểu dữ liệu | Mô tả |
| :---: | ----- | :---: | ----- |
| 1 | id | INT | ID tự tăng (Khóa chính), định danh yêu cầu hủy. |
| 2 | phieu\_dang\_ky\_id | INT | ID phiếu đăng ký muốn hủy (Khóa ngoại liên kết bảng PhieuDangKy, duy nhất). |
| 3 | ly\_do | NVARCHAR(500) | Lý do sinh viên viết đơn xin hủy chuyến. |
| 4 | file\_minh\_chung | NVARCHAR(500) | Đường dẫn lưu file minh chứng lý do hủy hợp lệ (giấy khám sức khỏe...). |
| 5 | ngay\_yeu\_cau | DATETIME2 | Ngày gửi yêu cầu hủy đăng ký. |
| 6 | trang\_thai\_duyet | NVARCHAR(15) | Trạng thái xét duyệt hủy (ChoDuyet, DaDuyet, TuChoi). Mặc định: ChoDuyet. |
| 7 | nguoi\_duyet\_id | INT | ID người duyệt đơn xin hủy (Khóa ngoại liên kết bảng TaiKhoan). |
| 8 | ngay\_duyet | DATETIME2 | Ngày thực tế thực hiện duyệt/từ chối đơn hủy. |

 

**19\. Bảng: DanhSachDen (Quản lý các trường hợp vi phạm quy chế kiến tập)**

 

| STT | Tên cột | Kiểu dữ liệu | Mô tả |
| :---: | ----- | :---: | ----- |
| 1 | id | INT | ID tự tăng (Khóa chính), định danh vi phạm. |
| 2 | sinh\_vien\_id | INT | ID sinh viên vi phạm (Khóa ngoại liên kết bảng SinhVien). |
| 3 | ly\_do | NVARCHAR(20) | Lý do bị phạt (KhongDongPhi, DangKyKhongThamGia, HuyKhongMinhChung). |
| 4 | phieu\_dang\_ky\_id | INT | ID phiếu đăng ký gốc liên quan trực tiếp đến vi phạm (Khóa ngoại liên kết PhieuDangKy, có thể NULL). |
| 5 | ngay\_ghi\_nhan | DATETIME2 | Ngày giờ phát hiện và ghi nhận vi phạm của sinh viên. |
| 6 | con\_hieu\_luc | BIT | Cờ trạng thái xử phạt còn áp dụng hay đã hết hạn (1: Còn, 0: Hết phạt). Mặc định: 1\. |

 

**20\. Bảng: HoaDonLePhi (Hóa đơn thu lệ phí chuyến đi)**

 

| STT | Tên cột | Kiểu dữ liệu | Mô tả |
| :---: | ----- | :---: | ----- |
| 1 | id | INT | ID tự tăng (Khóa chính), định danh hóa đơn. |
| 2 | phieu\_dang\_ky\_id | INT | ID phiếu đăng ký chuyến đi (Khóa ngoại liên kết bảng PhieuDangKy, duy nhất). |
| 3 | so\_tien | DECIMAL(12,0) | Số tiền lệ phí cần nộp. |
| 4 | noi\_dung\_chuyen\_khoan | NVARCHAR(100) | Mã cú pháp hệ thống tự sinh để SV ghi vào nội dung chuyển khoản (MSSV\_MaChuyen). |
| 5 | han\_dong | DATETIME2 | Hạn chót thanh toán hóa đơn này. |
| 6 | ngay\_dong\_thuc\_te | DATETIME2 | Thời điểm thực tế sinh viên nộp/chuyển tiền thành công. |
| 7 | trang\_thai | NVARCHAR(20) | Trạng thái đóng phí (ChuaDong, DaDongDungHan, ViPham, DaHoanPhi). Mặc định: ChuaDong. |

 

**21\. Bảng: DonHoanPhi (Đơn xin hoàn trả lại lệ phí khi hủy chuyến thành công)**

 

| STT | Tên cột | Kiểu dữ liệu | Mô tả |
| :---: | ----- | :---: | ----- |
| 1 | id | INT | ID tự tăng (Khóa chính), định danh đơn hoàn phí. |
| 2 | hoa\_don\_id | INT | ID hóa đơn liên quan (Khóa ngoại liên kết bảng HoaDonLePhi). |
| 3 | file\_don\_da\_duyet | NVARCHAR(500) | Đường dẫn lưu tệp scan đơn đã ký xác nhận của Ban chủ nhiệm khoa. |
| 4 | ngay\_nop | DATETIME2 | Ngày gửi đơn xin hoàn tiền. |
| 5 | trang\_thai | NVARCHAR(15) | Trạng thái giải quyết đơn hoàn phí (ChoXuLy, DaHoanTien, TuChoi). Mặc định: ChoXuLy. |
| 6 | nguoi\_xu\_ly\_id | INT | ID cán bộ tài vụ xử lý thủ tục hoàn tiền (Khóa ngoại liên kết TaiKhoan). |
| 7 | ngay\_xu\_ly | DATETIME2 | Ngày hoàn tất chuyển tiền hoàn trả. |

 

**22\. Bảng: PhanCongGVHD (Phân công Giảng viên hướng dẫn cho sinh viên)**

 

| STT | Tên cột | Kiểu dữ liệu | Mô tả |
| :---: | ----- | :---: | ----- |
| 1 | id | INT | ID tự tăng (Khóa chính), định danh phân công. |
| 2 | lich\_kien\_tap\_sinh\_vien\_id | INT | ID lượt đăng ký của sinh viên (Khóa ngoại liên kết bảng LichKienTap\_SinhVien). |
| 3 | giang\_vien\_id | INT | ID giảng viên hướng dẫn (Khóa ngoại liên kết bảng GiangVien). |
| 4 | ngay\_phan\_cong | DATETIME2 | Ngày được phân công làm GVHD. |
| 5 | trang\_thai | NVARCHAR(15) | Trạng thái hoạt động của quyết định phân công (DangHoatDong, DaGo). Mặc định: DangHoatDong. |

 

**23\. Bảng: DiemDanh (Bảng điểm danh SV đi thực tế)**

 

| STT | Tên cột | Kiểu dữ liệu | Mô tả |
| :---: | ----- | :---: | ----- |
| 1 | id | INT | ID tự tăng (Khóa chính), định danh lượt điểm danh. |
| 2 | phieu\_dang\_ky\_id | INT | ID phiếu đăng ký chuyến đi (Khóa ngoại liên kết bảng PhieuDangKy, duy nhất). |
| 3 | trang\_thai | NVARCHAR(15) | Trạng thái điểm danh (CoMat, Vang, TuChoiThamGia). |
| 4 | ghi\_chu | NVARCHAR(255) | Ghi chú thêm lý do vắng hoặc từ chối tham gia. |
| 5 | nguoi\_diem\_danh\_id | INT | ID giảng viên thực hiện điểm danh tại chỗ (Khóa ngoại liên kết GiangVien). |
| 6 | ngay\_diem\_danh | DATETIME2 | Thời điểm giảng viên xác nhận điểm danh. |

 

**24\. Bảng: BaiThuHoach (Nộp file bài báo cáo/thu hoạch chuyến đi của SV)**

 

| STT | Tên cột | Kiểu dữ liệu | Mô tả |
| :---: | ----- | :---: | ----- |
| 1 | id | INT | ID tự tăng (Khóa chính), định danh bài nộp. |
| 2 | phieu\_dang\_ky\_id | INT | ID phiếu đăng ký chuyến đi tương ứng (Khóa ngoại liên kết bảng PhieuDangKy). |
| 3 | file\_bao\_cao | NVARCHAR(500) | Đường dẫn lưu file bài báo cáo dạng .pdf. |
| 4 | file\_xac\_nhan\_tham\_quan | NVARCHAR(500) | Đường dẫn tệp giấy xác nhận tham quan (bắt buộc đối với chuyến đi tự do TuDo). |
| 5 | lan\_nop | INT | Lượt nộp bài thứ mấy của sinh viên. Mặc định: 1\. |
| 6 | ngay\_nop | DATETIME2 | Thời điểm sinh viên nộp bài lên hệ thống. |
| 7 | trang\_thai | NVARCHAR(15) | Trạng thái bài nộp (DaNop, ChoBoSung, TreHan). Mặc định: DaNop. |

 

**25\. Bảng: DiemPhieuDangKy (Bảng ghi nhận điểm số chi tiết cho từng chuyến đi)**

 

| STT | Tên cột | Kiểu dữ liệu | Mô tả |
| :---: | ----- | :---: | ----- |
| 1 | id | INT | ID tự tăng (Khóa chính), định danh bảng điểm. |
| 2 | phieu\_dang\_ky\_id | INT | ID phiếu đăng ký tương ứng (Khóa ngoại liên kết bảng PhieuDangKy, duy nhất). |
| 3 | diem\_chuan\_bi | DECIMAL(4,2) | Điểm chuẩn bị (trắc nghiệm/bài tập online), chiếm tỷ trọng 30%. |
| 4 | ngay\_lam\_bai\_chuan\_bi | DATETIME2 | Thời điểm làm bài chuẩn bị. |
| 5 | diem\_bai\_thu\_hoach\_ai | DECIMAL(4,2) | Điểm do công cụ AI tự động chấm và đề xuất trước. |
| 6 | diem\_bai\_thu\_hoach | DECIMAL(4,2) | Điểm bài thu hoạch do GVHD chấm chính thức, chiếm tỷ trọng 30%. |
| 7 | nhan\_xet\_bai\_thu\_hoach | NVARCHAR(MAX) | Nhận xét chi tiết của giảng viên về chất lượng bài nộp. |
| 8 | giang\_vien\_cham\_id | INT | ID giảng viên phụ trách chấm bài thu hoạch (Khóa ngoại liên kết GiangVien). |
| 9 | ngay\_cham\_bai\_thu\_hoach | DATETIME2 | Thời điểm giảng viên lưu điểm chấm bài. |
| 10 | diem\_bao\_cao\_tqnm | DECIMAL(4,2) | Điểm báo cáo chấm trước Hội đồng chấm, chiếm tỷ trọng 40%. |
| 11 | diem\_cong | DECIMAL(4,2) | Điểm cộng từ phát biểu trong chuyến tham quan (tối đa 1.0 điểm). Mặc định: 0\. |
| 12 | da\_khoa | BIT | Cờ khóa điểm của phiếu đăng ký (1: Đã khóa, 0: Chưa). Mặc định: 0\. |

 

**26\. Bảng: NhatKyDiemCong (Ghi nhận chi tiết từng lần phát biểu/đóng góp được điểm cộng)**

 

| STT | Tên cột | Kiểu dữ liệu | Mô tả |
| :---: | ----- | :---: | ----- |
| 1 | id | INT | ID tự tăng (Khóa chính), định danh dòng điểm cộng. |
| 2 | phieu\_dang\_ky\_id | INT | ID phiếu đăng ký của sinh viên phát biểu (Khóa ngoại liên kết bảng PhieuDangKy). |
| 3 | diem | DECIMAL(3,2) | Số điểm được cộng cho lượt phát biểu đó. Mặc định: 0.5. |
| 4 | giang\_vien\_ghi\_nhan\_id | INT | ID giảng viên dẫn đoàn ghi nhận và chấm (Khóa ngoại liên kết bảng GiangVien). |
| 5 | ngay\_ghi\_nhan | DATETIME2 | Thời điểm giảng viên tích chọn ghi nhận điểm cộng trên hệ thống. |

 

**27\. Bảng: HoiDongChamBaoCao (Hội đồng chấm báo cáo kết quả kiến tập)**

 

| STT | Tên cột | Kiểu dữ liệu | Mô tả |
| :---: | ----- | :---: | ----- |
| 1 | id | INT | ID tự tăng (Khóa chính), định danh hội đồng. |
| 2 | lich\_kien\_tap\_id | INT | ID lịch kiến tập tổ chức buổi chấm hội đồng (Khóa ngoại liên kết bảng LichKienTap). |
| 3 | ten\_hoi\_dong | NVARCHAR(150) | Tên gọi phân biệt của hội đồng (vd: 'Hội đồng số 1'). |
| 4 | ngay\_bao\_cao | DATETIME2 | Ngày giờ làm việc chính thức của hội đồng. |
| 5 | dia\_diem | NVARCHAR(150) | Địa điểm diễn ra (Phòng học trực tiếp hoặc link phòng họp trực tuyến). |

 

**28\. Bảng: HoiDong\_ThanhVien (Danh sách phân bổ giảng viên vào từng hội đồng)**

 

| STT | Tên cột | Kiểu dữ liệu | Mô tả |
| :---: | ----- | :---: | ----- |
| 1 | id | INT | ID tự tăng (Khóa chính), định danh thành viên. |
| 2 | hoi\_dong\_id | INT | ID hội đồng (Khóa ngoại liên kết bảng HoiDongChamBaoCao). |
| 3 | giang\_vien\_id | INT | ID giảng viên tham gia (Khóa ngoại liên kết bảng GiangVien). |
| 4 | vai\_tro | NVARCHAR(15) | Vai trò trong hội đồng (ChuTich, ThuKy, ThanhVien). Mặc định: ThanhVien. |

 

**29\. Bảng: DiemHoiDong\_ChiTiet (Chi tiết chấm điểm độc lập của từng thành viên hội đồng)**

 

| STT | Tên cột | Kiểu dữ liệu | Mô tả |
| :---: | ----- | :---: | ----- |
| 1 | id | INT | ID tự tăng (Khóa chính), định danh lượt chấm. |
| 2 | phieu\_dang\_ky\_id | INT | ID phiếu đăng ký của sinh viên báo cáo (Khóa ngoại liên kết bảng PhieuDangKy). |
| 3 | hoi\_dong\_thanhvien\_id | INT | ID thành viên hội đồng chấm điểm (Khóa ngoại liên kết bảng HoiDong\_ThanhVien). |
| 4 | diem | DECIMAL(4,2) | Điểm số độc lập được chấm từ thành viên này. |
| 5 | ngay\_cham | DATETIME2 | Ngày thực hiện chấm điểm. |

 

**30\. Bảng: BoChuyenBaoCao (Nhóm các chuyến đi chính thức cấu thành điểm học phần)**

 

| STT | Tên cột | Kiểu dữ liệu | Mô tả |
| :---: | ----- | :---: | ----- |
| 1 | id | INT | ID tự tăng (Khóa chính), định danh bộ chuyến báo cáo. |
| 2 | lich\_kien\_tap\_sinh\_vien\_id | INT | ID đăng ký học phần của sinh viên (Khóa ngoại liên kết LichKienTap\_SinhVien, duy nhất). |
| 3 | ngay\_chon | DATETIME2 | Ngày chốt chọn bộ chuyến. |
| 4 | tu\_dong | BIT | Chọn tự động bằng thuật toán hay do GVHD điều chỉnh bằng tay (1: Tự động, 0: Thủ công). Mặc định: 1\. |
| 5 | ghi\_chu\_dieu\_chinh\_gvhd | NVARCHAR(500) | Giải trình lý do thay đổi từ phía giảng viên hướng dẫn (nếu có). |

 

**31\. Bảng: BoChuyenBaoCao\_Chuyen (Quan hệ N-N liên kết các phiếu đăng ký thuộc bộ báo cáo)**

 

| STT | Tên cột | Kiểu dữ liệu | Mô tả |
| :---: | ----- | :---: | ----- |
| 1 | id | INT | ID tự tăng (Khóa chính), định danh dòng liên kết. |
| 2 | bo\_chuyen\_bao\_cao\_id | INT | ID bộ chuyến báo cáo gốc (Khóa ngoại liên kết bảng BoChuyenBaoCao). |
| 3 | phieu\_dang\_ky\_id | INT | ID phiếu đăng ký chuyến đi được lựa chọn vào bộ (Khóa ngoại liên kết bảng PhieuDangKy). |

 

**32\. Bảng: KetQuaHocPhan (Điểm tổng kết cuối cùng của học phần kiến tập)**

   
 

| STT | Tên cột | Kiểu dữ liệu | Mô tả |
| :---: | ----- | :---: | ----- |
| 1 | id | INT | ID tự tăng (Khóa chính), định danh kết quả học phần. |
| 2 | lich\_kien\_tap\_sinh\_vien\_id | INT | ID lượt học phần tương ứng của sinh viên (Khóa ngoại liên kết LichKienTap\_SinhVien, duy nhất). |
| 3 | bo\_chuyen\_bao\_cao\_id | INT | ID bộ chuyến chính thức dùng để tính điểm tổng (Khóa ngoại liên kết bảng BoChuyenBaoCao, duy nhất). |
| 4 | diem\_tong\_ket | DECIMAL(4,2) | Điểm trung bình cộng tổng kết học phần kiến tập của sinh viên. |
| 5 | ket\_qua | NVARCHAR(20) | Phân loại xếp loại cuối cùng (DangThucHien, Dat, KhongDat, ChuaHoanThanh). Mặc định: DangThucHien. |
| 6 | ngay\_khoa | DATETIME2 | Ngày giờ thực hiện khóa điểm chính thức gửi lên phòng đào tạo. |
| 7 | nguoi\_khoa\_id | INT | ID tài khoản quản lý khoa thực hiện khóa điểm (Khóa ngoại liên kết bảng TaiKhoan). |

   
