import toast from 'react-hot-toast';
import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, FileText, CheckCircle2, Save, Search, ChevronRight,
  ZoomIn, ZoomOut, Download, Sparkles, MessageSquareWarning, User,
  Filter, Check, ChevronDown, X, Lock, Minus, Maximize2, Building2, Award, ExternalLink
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api, { giangVienApi } from '../../services/api';
import SearchableDropdown from '../../components/SearchableDropdown';

export default function ChamBaiThuHoach_GV() {
  const navigate = useNavigate();
  const location = useLocation();

  const [lecturer, setLecturer] = useState(null);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [activeViewerTab, setActiveViewerTab] = useState('report'); // 'report' | 'confirmation'
  const [confirmationFile, setConfirmationFile] = useState(null);

  // Filter & Pagination states
  const [searchTerm, setSearchTerm] = useState(location.state?.filterMssv || '');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedDotId, setSelectedDotId] = useState('ALL');
  const [isDotDropdownOpen, setIsDotDropdownOpen] = useState(false);
  const [searchDotDropdown, setSearchDotDropdown] = useState('');
  const [selectedTripId, setSelectedTripId] = useState('ALL');
  const [isTripDropdownOpen, setIsTripDropdownOpen] = useState(false);
  const [searchTripDropdown, setSearchTripDropdown] = useState('');

  // Bulk AI Grading states (Background Progress)
  const [selectedReportIds, setSelectedReportIds] = useState([]);
  const [isBulkAiRunning, setIsBulkAiRunning] = useState(false);
  const [isBulkAiMinimized, setIsBulkAiMinimized] = useState(false);
  const [bulkAiProgress, setBulkAiProgress] = useState(0);
  const [bulkAiTotal, setBulkAiTotal] = useState(0);
  const [bulkAiCurrentStudent, setBulkAiCurrentStudent] = useState('');
  const [bulkAiStatusText, setBulkAiStatusText] = useState('');
  const [bulkAiIsCompleted, setBulkAiIsCompleted] = useState(false);
  const isBulkAiCanceled = React.useRef(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(15);

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isGradingAI, setIsGradingAI] = useState(false);
  const [aiGradingResult, setAiGradingResult] = useState(null);
  const [isExpandedComments, setIsExpandedComments] = useState(false);
  const [isMockModalOpen, setIsMockModalOpen] = useState(false);
  const [mockText, setMockText] = useState(`TRANG 20
* BÁO CÁO KIẾN TẬP – HỌC KỲ 2 NĂM HỌC 2024 - 2025

* BÀI THU HOẠCH CƠ SỞ THAM QUAN THỨ HAI

* NHÀ MÁY/CÔNG TY CỔ PHẦN ĐẦU TƯ VÀ THƯƠNG MẠI SATORI

* 2.1. Giới thiệu về nhà máy/công ty

   * 2.1.1. Tổng quan chung về công ty/nhà máy

   * Địa chỉ nhà máy: Lô ..., đường số 3, khu công nghiệp Long Hậu, xã Long Hậu, huyện Cần Giuộc, tỉnh Long An.
   * Thành lập năm 2017 Satori hoạt động trong lĩnh vực sản xuất và kinh doanh các sản phẩm nước uống, với sứ mệnh mang đến nhiều lựa chọn hơn cho người tiêu dùng về một thương hiệu không chỉ để giải khát mà còn tốt cho sức khỏe.
   * Để giúp người tiêu dùng có những cảm nhận rõ hơn về những gì Satori đang thực hiện, nhà máy xây dựng mô hình nhà máy mở, hỗ trợ khách tham quan các hoạt động bên trong nhà máy, trực tiếp quan sát quy trình công nghệ tiên tiến của Satori.
   * Công ty lắp đặt dây chuyền sản xuất tự động hóa từ nhà cung cấp sidel với công suất thiết kế 12.000 chai/ giờ cho dòng chai và 450 bình/ giờ cho dòng bình đáp ứng nhu cầu người tiêu dùng.
      * Quy trình quản lý Satori:

         * Nhằm mang lại sản phẩm chất lượng cao nhằm đến tay người tiêu dùng.
         * Satori áp dụng những quy trình quản lý chất lượng tiên tiến nghiêm ngặt.
         * Satori thường xuyên kiểm nghiệm chất lượng nước với tần suất 416 lần / ngày, 2912 lần / tuần, 151840 lần / năm.
         * Chứng nhận chất lượng:

            * Satori từng bước trên hành trình tiêu chuẩn vàng để mỗi chai nước đến tay người tiêu dùng đều là sản phẩm sạch.
            4. Chứng nhận FSSC 22000
            5. Chứng nhận ISO 22000
            6. Chứng nhận HACCP
            7. Thành viên hiệp hội nước đóng chai thế giới
            * SVTH: Lê Thị Minh Yến
TRANG 22
            * BÁO CÁO KIẾN TẬP – HỌC KỲ 2 NĂM HỌC 2024 - 2025

            * 2.1.2. Một số sản phẩm chủ yếu của công ty/nhà máy

               * Satori là nước uống tinh khiết với công nghệ hoàn lưu khoáng SRO, giúp giữ lại một phần hàm lượng khoáng tự nhiên có sẵn trong nước.
               * Được xử lý qua hệ thống thẩm thấu ngược RO từ Nhật Bản với màng siêu lọc UF, khử trùng bằng tia cực tím và Ozon.
               * Các sản phẩm của Satori: nước Satori 350 ml, 500ml, nước Satori 1.5l, bình nước Satori 20l.
               * SVTH: Lê Thị Minh Yến
TRANG 24
               * BÁO CÁO KIẾN TẬP – HỌC KỲ 2 NĂM HỌC 2024 - 2025

               * 2.2. Quy trình công nghệ sản xuất nước tinh khiết với công nghệ hoàn lưu khoáng

               * 2.2.1. Sơ đồ quy trình công nghệ

                  * Nước ngầm đã xử lí
                  * Tiền xử lý
                  * Siêu lọc UF
                  * Lọc thẩm thấu ngược RO
                  * Hoàn lưu khoáng SRO
                  * Tiệt trùng UV
                  * Vi lọc
                  * Ozon
                  * Nước tinh khiết
                  * SVTH: Lê Thị Minh Yến
TRANG 25
                  * BÁO CÁO KIẾN TẬP – HỌC KỲ 2 NĂM HỌC 2024 - 2025

                  * 2.2.2. Thuyết minh quy trình công nghệ

                     * Bước 1: Tiếp nhận nguồn nước ngầm đã được xử lý theo chuẩn Bộ Y tế.
                     * Bước 2: Tiền xử lý. Mục đích: loại bỏ màu, mùi cho nước, giúp nước trở nên trong suốt.
                     * Bước 3: Công nghệ màng siêu lọc UF (Ultra Filtration). Bản chất: kích thước 0,01 micron đến từ Nhật Bản giúp lọc sạch các vi khuẩn và tạp chất siêu nhỏ. Thiết bị: thiết bị siêu lọc dạng sợi rỗng cột đứng.
                     * Bước 4: Công nghệ thẩm thấu ngược RO (Reverse Osmosis). Mục đích: giúp nước trở nên tinh khiết. Phương pháp: thẩm thấu ngược chỉ cho dung môi (nước) đi qua membrane, toàn bộ cấu tử hòa tan và không hòa tan bị giữ lại trên bề mặt membrane.
                     * Bước 5: Công nghệ hoàn lưu khoáng SRO (Selective Reverse Osmosis). Mục đích: Đóng vai trò giữ lại một phần khoáng tự nhiên tốt cho cơ thể được hoàn lưu vào dòng nước tinh khiết.
                     * Bước 6: Tiệt trùng bằng tia UV (Ultra Violet). Mục đích: Tiêu diệt VSV, ngăn ngừa tái nhiễm khuẩn. Bản chất: tia UV có khả năng ức chế vi sinh vật và tiêu diệt. Yếu tố ảnh hưởng: công suất đèn UV, độ dày lớp nước, thời gian tiếp xúc của nước với đèn UV.
                     * Bước 7: Vi lọc. Mục đích: Lọc vi khuẩn bằng bộ vi lọc 0,2 µm. Hoàn thiện lọc tế bào vi sinh, giúp nước trở nên tinh khiết. Bản chất: vi lọc tạo ra nguồn nước đạt chuẩn vi sinh rất tốt, đảm bảo cho người dùng. Phương pháp: membrane dạng màng.
                     * Bước 8: Công nghệ Ozon. Bản chất: Dùng ozon đảm bảo sự tinh khiết tối đa cho nước thành phẩm, sẵn sàng đưa vào cung cấp cho dây chuyền chiết rót. Mục đích: Hoàn thiện, đảm bảo tinh khiết tối đa cho sản phẩm.
                     * SVTH: Lê Thị Minh Yến
TRANG 26
                     * BÁO CÁO KIẾN TẬP – HỌC KỲ 2 NĂM HỌC 2024 - 2025

                     * 9 BƯỚC ĐÓNG CHAI THÀNH PHẨM (dòng chai 350ml, 500ml, 1.5 Lít)

                        * Bước 1: Thổi chai, định hình chai, rửa chai bằng nước thành phẩm.
                        * Bước 2: Chiết rót nước vào chai đã được làm sạch, hệ thống AHU hiện đại.
                        * Bước 3: Tiến hành đóng nắp chai tự động hóa, được kiểm soát chặt chẽ.
                        * Bước 4: Dán nhãn chai tự động.
                        * Bước 5: Công đoạn phóng màng co nắp, giúp giữ khí và ngăn chặn bụi hay vi khuẩn xâm nhập.
                        * Bước 6: In mã code, Hạn sử dụng, Ngày sản xuất lên chai nước.
                        * Bước 7: Các chai nước được xếp ngăn nắp vào thùng carton.
                        * Bước 8: In mã code, Hạn sử dụng, Ngày sản xuất lên từng thùng.
                        * Bước 9: Chất xếp thùng bằng hệ thống robot hiện đại.
                        * QUY TRÌNH 14 BƯỚC RỬA BÌNH 20 Lít

                           * Bước 1: Rửa hai mặt trong và ngoài bình bằng nước nóng.
                           * Bước 2: Rửa bằng dung dịch NaOH cả hai mặt để loại bỏ các hợp chất hữu cơ.
                           * Bước 3, 4: Thổi khô bên trong và ngoài bình.
                           * Bước 5, 6, 7, 8: Tất cả bình sẽ được rửa bằng nước nóng với nhiệt độ cao để đảm bảo làm sạch và diệt khuẩn tốt nhất.
                           * Bước 9: Rửa bằng dung dịch HNO3 để loại bỏ các hợp chất vô cơ.
                           * Bước 10: Thổi khô bên trong và bên ngoài bình trước khi tới bước tiếp theo.
                           * Bước 11: Tiếp tục rửa bình với nước nóng.
                           * Bước 12, 13: Rửa bình bằng nước Ozon để loại bỏ tối đa vi khuẩn.
                           * Bước 14: Tráng rửa bằng nước thành phẩm.
                           * SVTH: Lê Thị Minh Yến
TỪ TRANG 31 ĐẾN TRANG 37 - ĐÁNH GIÁ THỰC TRẠNG
                           * BÁO CÁO KIẾN TẬP – HỌC KỲ 2 NĂM HỌC 2024 - 2025

                           * 2.3. Đánh giá thực trạng điều kiện đảm bảo vệ sinh an toàn thực phẩm tại cơ sở

TT	Yêu cầu	Thực trạng (Mô tả thực trạng quan sát được tại nhà máy)	Đánh giá
1.	KHÂU BAN ĐẦU, HOẠT ĐỘNG TRƯỚC CHẾ BIẾN
1.1	Môi trường an toàn	Không nguồn lây nhiễm vào khu vực khai thác, nuôi trồng, thu hoạch. Điều kiện vệ sinh môi trường.	Đạt
1.2	Nguyên liệu sản xuất hợp vệ sinh	Các nguồn thực phẩm được sản xuất một cách vệ sinh.	Đạt
1.3	Phương pháp vận chuyển phù hợp	Hoạt động xử lý, bảo quản và vận chuyển nguyên vật liệu trước khi chế biến.	Đạt
1.4	Nhà máy bố trí riêng biệt	Việc làm sạch, bảo dưỡng thiết bị sản xuất được thực hiện hiệu quả. Nhà máy bố trí riêng biệt.	Đạt
1.5	Đảm bảo vệ sinh cá nhân được duy trì mức độ thích hợp	Duy trì mức vệ sinh cá nhân.	Đạt
2.	CƠ SỞ: THIẾT KẾ VÀ PHƯƠNG TIỆN
2.1	Vị trí xây dựng nhà xưởng	Tránh nơi xa, không ô nhiễm. Khu vực dễ ngập lụt: hoàn toàn cách biệt. Khu vực dễ bị sâu bệnh phá hoại: cách biệt.	Đạt
2.2	Thiết kế, bố trí các khu vực/phòng sản xuất	Thuận lợi chế biến và làm vệ sinh. Đạt an toàn: ngăn ngừa lây nhiễm chéo.	Đạt
2.3	Cấu trúc, lắp ráp bên trong nhà xưởng	Vật liệu bền, dễ bảo trì, sử dụng tường, vách ngăn phù hợp cho khai thác; trần thiết kế đơn giản, cửa sổ hạn chế tích bụi, trang bị màn chắn, thiết kế phù hợp. Sàn xây dựng thoát nước tốt. Cửa ra vào nhẵn, không thấm nước.	Đạt
2.4	Trang thiết bị sản xuất chính	Phù hợp, thuận lợi sản xuất. Thiết bị hiện đại.	Đạt
2.5	Thiết bị kiểm soát và giám sát thực phẩm (Thiết bị xử lý nhiệt, làm mát, bảo quản hoặc cấp đông thực phẩm...)	Nhiệt độ phù hợp. Thiết bị hiện đại.	Đạt
2.6	Đồ đựng chất phế thải và các thứ không ăn được	Chuyên dụng. Thùng chứa chất thải được nhận diện và khóa.	Đạt
2.7	Hệ thống cung cấp nước	Đầy đủ. An toàn. Cách biệt.	Đạt
2.8	Hệ thống thoát nước và xử lý rác thải: Phải thiết kế tránh lây nhiễm chéo vào thực phẩm và nguồn nước sạch	Thiết kế hợp lý. Tách biệt.	Đạt
2.9	Phương tiện làm vệ sinh thiết bị, nhà xưởng	Đầy đủ, chuyên dụng. Trang bị hệ thống nước nóng lạnh ở nơi cần thiết.	Đạt
2.10	Phương tiện vệ sinh cá nhân và nhà vệ sinh	Đầy đủ. Sạch sẽ. Thiết kế và bố trí hợp lý.	Đạt
2.11	Chất lượng không khí và sự thông gió	Hạn chế tối thiểu nhiễm bẩn thực phẩm do không khí. Kiểm soát nhiệt độ môi trường xung quanh, kiểm soát mùi và độ ẩm không khí ảnh hưởng tới thực phẩm. Dễ bảo trì, vệ sinh.	Đạt
2.12	Hệ thống chiếu sáng	Đủ ánh sáng. Đảm bảo cho chế biến.	Đạt
2.13	Phương tiện bảo quản thực phẩm	Thích hợp bảo quản theo tính chất thực phẩm. Dễ bảo trì và làm vệ sinh. Ngăn khuẩn xâm nhập của côn trùng và động vật gây hại. Bảo vệ thực phẩm không bị hư hỏng.	Đạt
3.	KIỂM SOÁT CÁC HOẠT ĐỘNG SẢN XUẤT
3.1	Kiểm soát các mối nguy ATTP trong quá trình sản xuất	ISO 22000. HACCP.	Đạt
3.2	Kiểm soát thông số công nghệ trong quá trình sản xuất	Kiểm soát nhiệt độ và thời gian ở các công đoạn quan trọng: làm lạnh, gia nhiệt, chiếu xạ, bảo quản, bao gói, chân không được kiểm soát chặt chẽ. Các thiết bị được kiểm tra định kỳ.	Đạt
3.3	Kiểm soát nhiễm chéo vi sinh vật	Môi trường khép kín. Có đồ bảo hộ.	Đạt
3.4	Hoạt động kiểm soát nguyên liệu đầu vào	Nguyên liệu đạt chất lượng. Nguyên liệu đạt chuẩn.	Đạt
3.5	Kiểm soát quá trình bao gói/đóng gói	Vật liệu bao bì an toàn. Bao bì tiệt trùng.	Đạt
3.6	Kiểm soát an toàn nguồn nước, nước đá	Nước sạch. Đảm bảo an toàn.	Đạt
4.	BẢO DƯỠNG VÀ LÀM VỆ SINH
4.1	Quy trình và phương pháp làm vệ sinh nhà xưởng	Sạch, an toàn. Đúng quy định về hóa chất tẩy rửa. Quy trình phù hợp.	Đạt
4.2	Quy trình và phương pháp làm vệ sinh thiết bị	Thiết lập chương trình làm vệ sinh phù hợp. Thực hiện giám sát đúng thông số.	Đạt
4.3	Kiểm soát động vật gây hại	Biện pháp ngăn chặn hiệu quả. An toàn.	Đạt
4.4	Quản lý chất thải	Thu gom theo quy định (chất thải). Khu chứa chất thải đảm bảo vệ sinh đạt chuẩn.	Đạt
5.	VỆ SINH CÁ NHÂN
5.1	Kiểm tra tình trạng sức khỏe của người lao động	Cá nhân vào khu sản xuất phải có sức khoẻ tốt, không mang mầm bệnh vào thực phẩm. Kiểm tra sức khỏe định kỳ cho công nhân.	Đạt
5.2	Giám sát vệ sinh cá nhân của người lao động	Người tiếp xúc thực phẩm phải có bảo hộ lao động, ý thức tốt.	Đạt
5.3	Giám sát vệ sinh cá nhân khách tham quan	Phải mặc đồ bảo hộ lao động đúng quy định vệ sinh.	Đạt
6.	NHỮNG VẤN ĐỀ KHÁC (Nếu có)
6.1	Vận chuyển	Thực phẩm bảo quản an toàn. Phương thức vận chuyển phù hợp.	Đạt
6.2	Phương tiện vận chuyển	Dễ vệ sinh, khử trùng và bảo trì. Làm từ vật liệu không nhiễm bẩn. Chuyên dùng, sạch sẽ.	Đạt
SVTH: Lê Thị Minh Yến (Lưu ý: Tên SVTH lặp lại ở chân các trang từ 31 đến 37)
TRANG 38
* BÁO CÁO KIẾN TẬP – HỌC KỲ 2 NĂM HỌC 2024 - 2025
* 2.4. Nhận xét – Kiến nghị
* Nhận xét:
   * Sau chuyến tham quan nhà máy Satori em học hỏi được nhiều bài học quý báu cũng như trau dồi kiến thức thêm.
   * Biết quy trình xử lý nước của nhà máy.
   * Dây chuyền sản xuất hiện đại.
   * Công nghệ xử lý nước hoàn lưu khoáng.
   * Trực tiếp tham quan quy trình rửa chai chiết rót.
   * Qua chuyến tham quan ta thấy nhà máy Satori trang bị dây chuyền sản xuất khép kín, hiện đại.
* Kiến nghị:
   * Tuy nhiên, tại thị trường Việt Nam, sản phẩm Satori chưa được người dùng biết đến rộng rãi vì vậy công ty cần đầu tư thêm vào mảng marketing để quảng bá thương hiệu đến người tiêu dùng.
   * SVTH: Lê Thị Minh Yến
`);

  const handleBulkAiGrading = async () => {
    if (selectedReportIds.length === 0) return;
    const reportIdsToProcess = [...selectedReportIds];
    setSelectedReportIds([]); // Bỏ chọn để giảng viên tự do thao tác trên danh sách
    setIsBulkAiRunning(true);
    setIsBulkAiMinimized(false);
    setBulkAiIsCompleted(false);
    setBulkAiTotal(reportIdsToProcess.length);
    setBulkAiProgress(0);
    setBulkAiStatusText('Khởi tạo quá trình chấm điểm hàng loạt...');
    isBulkAiCanceled.current = false;

    let successCount = 0;
    for (let i = 0; i < reportIdsToProcess.length; i++) {
      if (isBulkAiCanceled.current) {
        setBulkAiStatusText('Đã dừng tiến trình.');
        break;
      }
      const reportId = reportIdsToProcess[i];
      const report = reports.find(r => r.id === reportId);
      if (!report) continue;

      const sv = report.phieuThamQuan?.phieuDangKy?.sinhVien || report.phieuDangKy?.sinhVien;
      const studentName = sv?.ho_ten || 'Sinh viên';
      setBulkAiCurrentStudent(studentName);
      setBulkAiStatusText(`Đang tải dữ liệu bài nộp...`);

      try {
        let apiPath = report.file_bao_cao;
        if (!apiPath) {
          setBulkAiStatusText(`Bỏ qua: Không có file đính kèm`);
          continue;
        }
        if (apiPath.startsWith('reports/')) apiPath = `upload/file/${apiPath}`;
        else if (!apiPath.startsWith('upload/file/')) apiPath = `upload/file/reports/${apiPath}`;
        if (apiPath.startsWith('/')) apiPath = apiPath.substring(1);

        const txtApiPath = '/' + apiPath.replace(/\.\w+$/, '.txt');
        let textToAnalyze = '';
        try {
          const respTxt = await api.get(txtApiPath, { responseType: 'text' });
          if (respTxt.data) textToAnalyze = respTxt.data;
        } catch (e) {
          setBulkAiStatusText(`Bỏ qua: Chưa trích xuất được text cho bài này`);
          continue;
        }

        if (!textToAnalyze) {
          setBulkAiStatusText(`Bỏ qua: Nội dung văn bản trống`);
          continue;
        }

        setBulkAiStatusText(`Đang phân tích và chấm điểm bằng AI...`);
        const aiRes = await fetch('http://localhost:8000/grade', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer satori_2026_secure_key'
          },
          body: JSON.stringify({ document_text: textToAnalyze })
        });

        if (!aiRes.ok) {
          setBulkAiStatusText(`Thất bại: Lỗi từ máy chủ AI`);
          continue;
        }

        const aiData = await aiRes.json();
        setBulkAiStatusText(`Đang lưu đề xuất điểm ${aiData.diem_bao_cao_cuoi_cung}...`);

        const diemHT = aiData.hinh_thuc_tong_quan?.diem_hinh_thuc ?? '';
        const diemTQ = aiData.hinh_thuc_tong_quan?.diem_tong_quan ?? '';
        const diemQT = aiData.quy_trinh_cong_nghe?.diem_quy_trinh ?? '';
        const diemVS = aiData.vsattp?.diem_vsattp ?? '';

        let aiComment = 
          `1. Hình thức${diemHT !== '' ? ` [Điểm: ${diemHT}]` : ''}: ${aiData.hinh_thuc_tong_quan?.ly_do_hinh_thuc || 'Đạt'}\n` +
          `2. Tổng quan${diemTQ !== '' ? ` [Điểm: ${diemTQ}]` : ''}: ${aiData.hinh_thuc_tong_quan?.ly_do_tong_quan || 'Đạt'}\n` +
          `3. Quy trình${diemQT !== '' ? ` [Điểm: ${diemQT}]` : ''}: ${aiData.quy_trinh_cong_nghe?.ly_do_quy_trinh || 'Đạt'}\n` +
          `4. VSATTP${diemVS !== '' ? ` [Điểm: ${diemVS}]` : ''}: ${aiData.vsattp?.ly_do_vsattp || 'Đạt'}`;

        await api.post('/giang-vien/save-ai-grade', {
          reportId: reportId,
          score: aiData.diem_bao_cao_cuoi_cung,
          comment: aiComment
        });

        // Cập nhật real-time vào danh sách reports trong bộ nhớ
        setReports(prev => prev.map(r => {
          if (r.id === reportId) {
            return {
              ...r,
              diem_ai_de_xuat: aiData.diem_bao_cao_cuoi_cung,
              nhan_xet_cua_giang_vien: aiComment,
              nhan_xet_thu_hoach: aiComment,
              nhan_xet_ai_de_xuat: aiComment
            };
          }
          return r;
        }));

        // Nếu giảng viên đang mở đúng bài này, cập nhật luôn kết quả đề xuất AI lên sidebar
        if (selectedReport?.id === reportId) {
          setAiGradingResult(aiData);
        }

        successCount++;
        setBulkAiProgress(prev => prev + 1);

      } catch (err) {
        console.error(err);
        setBulkAiStatusText(`Thất bại: Có lỗi xảy ra trong quá trình xử lý`);
      }
    }

    setBulkAiIsCompleted(true);
    if (isBulkAiCanceled.current) {
      setBulkAiStatusText(`Đã dừng tiến trình. Đã hoàn thành ${successCount}/${reportIdsToProcess.length} bài.`);
    } else {
      setBulkAiStatusText(`Hoàn tất chấm điểm AI cho ${successCount}/${reportIdsToProcess.length} bài!`);
      toast.success(`Đã hoàn tất chấm điểm AI hàng loạt (${successCount}/${reportIdsToProcess.length} bài)!`);
    }
    if (lecturer) fetchReports(lecturer.id);
  };

  const handleAIGrading = async () => {
    setIsGradingAI(true);
    try {
      const response = await fetch('http://localhost:8000/grade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer satori_2026_secure_key'
        },
        body: JSON.stringify({ document_text: reportText })
      });
      if (!response.ok) {
        throw new Error('Lỗi khi gọi AI service');
      }
      const data = await response.json();
      setAiGradingResult(data);

      const diemHT = data.hinh_thuc_tong_quan?.diem_hinh_thuc ?? '';
      const diemTQ = data.hinh_thuc_tong_quan?.diem_tong_quan ?? '';
      const diemQT = data.quy_trinh_cong_nghe?.diem_quy_trinh ?? '';
      const diemVS = data.vsattp?.diem_vsattp ?? '';

      const aiComment = 
        `1. Hình thức${diemHT !== '' ? ` [Điểm: ${diemHT}]` : ''}: ${data.hinh_thuc_tong_quan?.ly_do_hinh_thuc || 'Đạt'}\n` +
        `2. Tổng quan${diemTQ !== '' ? ` [Điểm: ${diemTQ}]` : ''}: ${data.hinh_thuc_tong_quan?.ly_do_tong_quan || 'Đạt'}\n` +
        `3. Quy trình${diemQT !== '' ? ` [Điểm: ${diemQT}]` : ''}: ${data.quy_trinh_cong_nghe?.ly_do_quy_trinh || 'Đạt'}\n` +
        `4. VSATTP${diemVS !== '' ? ` [Điểm: ${diemVS}]` : ''}: ${data.vsattp?.ly_do_vsattp || 'Đạt'}`;

      if (selectedReport) {
        try {
          await api.post('/giang-vien/save-ai-grade', {
            reportId: selectedReport.id,
            score: data.diem_bao_cao_cuoi_cung,
            comment: aiComment
          });
          setReports(prev => prev.map(r => r.id === selectedReport.id ? {
            ...r,
            diem_ai_de_xuat: data.diem_bao_cao_cuoi_cung,
            nhan_xet_ai_de_xuat: aiComment
          } : r));
          setSelectedReport(prev => prev ? {
            ...prev,
            diem_ai_de_xuat: data.diem_bao_cao_cuoi_cung,
            nhan_xet_ai_de_xuat: aiComment
          } : prev);
        } catch (e) {
          console.error("Không thể lưu điểm AI tự động:", e);
        }
      }

      toast.success('Đã chấm điểm xong bằng AI!');
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi chấm điểm bằng AI');
    } finally {
      setIsGradingAI(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setIsStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Grading states
  const [score, setScore] = useState('');
  const [comments, setComments] = useState('');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [reportText, setReportText] = useState('');
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [isLoadingText, setIsLoadingText] = useState(false);

  const handleInsertTemplate = () => {
    if (aiGradingResult) {
      const aiComment = `1. Hình thức: ${aiGradingResult.hinh_thuc_tong_quan.ly_do_hinh_thuc}\n2. Tổng quan: ${aiGradingResult.hinh_thuc_tong_quan.ly_do_tong_quan}\n3. Quy trình: ${aiGradingResult.quy_trinh_cong_nghe.ly_do_quy_trinh}\n4. VSATTP: ${aiGradingResult.vsattp.ly_do_vsattp}`;
      setComments(prev => prev ? prev + '\n\n' + aiComment : aiComment);
      toast.success('Đã chèn mẫu nhận xét từ AI');
    } else {
      const basicTemplate = `1. Hình thức trình bày: \n2. Tổng quan nhà máy: \n3. Quy trình công nghệ: \n4. Đánh giá VSATTP: `;
      setComments(prev => prev ? prev + '\n\n' + basicTemplate : basicTemplate);
      toast.success('Đã chèn sườn nhận xét cơ bản');
    }
  };

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const { user } = JSON.parse(userJson);
      giangVienApi.getProfile(user.id).then(res => {
        setLecturer(res.data);
        fetchReports(res.data.id);
      }).catch(err => console.error(err));
    }
  }, []);

  const fetchReports = async (gvId) => {
    try {
      const res = await giangVienApi.getGuidedReports(gvId, { limit: 100 });
      // Depending on API, reports are in res.data or res.data.data
      const data = res.data.data ? res.data.data : res.data;
      setReports(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectReport = async (report) => {
    setSelectedReport(report);

    // 1. Chỉ hiển thị điểm và nhận xét giảng viên nếu giảng viên ĐÃ chấm (diem_thu_hoach khác null)
    setScore(report.diem_thu_hoach !== null ? report.diem_thu_hoach : '');
    setComments(report.diem_thu_hoach !== null ? (report.nhan_xet_cua_giang_vien || report.nhan_xet_thu_hoach || '') : '');

    // 2. Tái tạo lại dữ liệu AI để nạp vào mục AI (ẩn nút Chấm tự động và hiện form AI)
    if (report.diem_ai_de_xuat !== null && report.diem_ai_de_xuat !== undefined) {
      // Ưu tiên đọc từ nhan_xet_ai_de_xuat, nếu chưa có thì lấy từ nhan_xet_cua_giang_vien / nhan_xet_thu_hoach
      let aiCommentStr = report.nhan_xet_ai_de_xuat || report.nhan_xet_cua_giang_vien || report.nhan_xet_thu_hoach || '';

      let hinhThuc = "", tongQuan = "", quyTrinh = "", vsattp = "";
      let diemHT = "Đạt", diemTQ = "Đạt", diemQT = "Đạt", diemVS = "Đạt";

      if (aiCommentStr) {
        try {
          const parts = aiCommentStr.split(/(?=\d\.\s)/);
          parts.forEach(p => {
            const trimmed = p.trim();
            if (trimmed.startsWith('1. Hình thức')) {
              let text = trimmed.replace(/^1\.\s*Hình thức\s*(\[.*?\])?\s*:\s*/i, '').trim();
              const mScore = trimmed.match(/\[Điểm:\s*([\d\.]+)\]/i);
              if (mScore) diemHT = mScore[1];
              hinhThuc = text;
            } else if (trimmed.startsWith('2. Tổng quan')) {
              let text = trimmed.replace(/^2\.\s*Tổng quan\s*(\[.*?\])?\s*:\s*/i, '').trim();
              const mScore = trimmed.match(/\[Điểm:\s*([\d\.]+)\]/i);
              if (mScore) diemTQ = mScore[1];
              tongQuan = text;
            } else if (trimmed.startsWith('3. Quy trình')) {
              let text = trimmed.replace(/^3\.\s*Quy trình\s*(\[.*?\])?\s*:\s*/i, '').trim();
              const mScore = trimmed.match(/\[Điểm:\s*([\d\.]+)\]/i);
              if (mScore) diemQT = mScore[1];
              quyTrinh = text;
            } else if (trimmed.startsWith('4. VSATTP')) {
              let text = trimmed.replace(/^4\.\s*VSATTP\s*(\[.*?\])?\s*:\s*/i, '').trim();
              const mScore = trimmed.match(/\[Điểm:\s*([\d\.]+)\]/i);
              if (mScore) diemVS = mScore[1];
              vsattp = text;
            }
          });
        } catch (e) {
          console.error("Lỗi parse text AI:", e);
        }
      }

      setAiGradingResult({
        diem_bao_cao_cuoi_cung: report.diem_ai_de_xuat,
        hinh_thuc_tong_quan: {
          diem_hinh_thuc: diemHT,
          ly_do_hinh_thuc: hinhThuc || (aiCommentStr ? aiCommentStr : 'Đạt yêu cầu về hình thức trình bày báo cáo.'),
          diem_tong_quan: diemTQ,
          ly_do_tong_quan: tongQuan || 'Đạt yêu cầu về tổng quan nhà máy/công ty.'
        },
        quy_trinh_cong_nghe: {
          diem_quy_trinh: diemQT,
          ly_do_quy_trinh: quyTrinh || 'Đạt yêu cầu về thuyết minh quy trình công nghệ.'
        },
        vsattp: {
          diem_vsattp: diemVS,
          ly_do_vsattp: vsattp || 'Đạt yêu cầu về đánh giá thực trạng VSATTP.'
        }
      });
    } else {
      // Nếu chưa có điểm AI, reset mục AI để hiện nút "Chấm tự động"
      setAiGradingResult(null);
    }

    setActiveViewerTab('report');
    if (report.file_xac_nhan_tham_quan) {
      let xnPath = report.file_xac_nhan_tham_quan;
      if (xnPath.startsWith('/api/')) xnPath = xnPath.substring(5);
      if (xnPath.startsWith('attachments/') || xnPath.startsWith('payments/')) {
        xnPath = `upload/file/${xnPath}`;
      } else if (!xnPath.startsWith('upload/file/')) {
        xnPath = `upload/file/attachments/${xnPath}`;
      }
      if (xnPath.startsWith('/')) xnPath = xnPath.substring(1);

      api.get('/' + xnPath, { responseType: 'blob' })
        .then(res => {
          if (res.data) {
            const blobUrl = URL.createObjectURL(res.data);
            const isImg = res.headers['content-type']?.startsWith('image/') || /\.(png|jpe?g)$/i.test(xnPath);
            setConfirmationFile({ url: blobUrl, isImage: isImg, name: xnPath.split('/').pop() });
          }
        })
        .catch(err => {
          console.warn('Không tải được giấy xác nhận:', err);
          setConfirmationFile(null);
        });
    } else {
      setConfirmationFile(null);
    }

    if (report.file_bao_cao) {
      setIsLoadingText(true);
      setReportText('');
      setPdfBlobUrl(null);
      try {
        let apiPath = report.file_bao_cao;
        if (apiPath.startsWith('/api/')) {
          apiPath = apiPath.substring(5); // remove /api/
        }
        if (apiPath.startsWith('reports/')) {
          apiPath = `upload/file/${apiPath}`;
        } else if (!apiPath.startsWith('upload/file/')) {
          apiPath = `upload/file/reports/${apiPath}`;
        }
        if (apiPath.startsWith('/')) apiPath = apiPath.substring(1);

        // Fetch PDF Blob
        try {
          const respPdf = await api.get('/' + apiPath, { responseType: 'blob' });
          if (respPdf.data) {
            setPdfBlobUrl(URL.createObjectURL(respPdf.data));
          }
        } catch (pdfErr) {
          console.warn('Không tải được file PDF:', pdfErr);
        }

        const txtApiPath = '/' + apiPath.replace(/\.\w+$/, '.txt');
        const respTxt = await api.get(txtApiPath, { responseType: 'text' });
        if (respTxt.data) {
          setReportText(respTxt.data);
        } else {
          setReportText('Không tìm thấy nội dung bài thu hoạch.');
        }
      } catch (err) {
        console.warn('Không tìm thấy file text trích xuất:', err);
        setReportText('Hệ thống chưa trích xuất nội dung văn bản cho báo cáo này. Vui lòng tải file gốc để xem.');
      } finally {
        setIsLoadingText(false);
      }
    } else {
      setReportText('Sinh viên chưa nộp file đính kèm.');
      setPdfBlobUrl(null);
    }
  };

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    if (!score || score < 0 || score > 10) {
      toast.error("Vui lòng nhập điểm hợp lệ (0-10)");
      return;
    }
    try {
      await giangVienApi.gradeReport({
        reportId: selectedReport.id,
        score: parseFloat(score),
        comment: comments
      });
      toast.success('Đã lưu điểm thành công!');
      setSelectedReport(null);
      if (lecturer) fetchReports(lecturer.id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi chấm điểm');
    }
  };

  const isReportsLocked = React.useMemo(() => {
    if (reports.length === 0) return false;
    const currentList = selectedDotId === 'ALL' 
      ? reports 
      : reports.filter(r => {
          const ctq = r.phieuThamQuan?.phieuDangKy?.chuyenThamQuan || r.phieuDangKy?.chuyenThamQuan;
          return ctq?.lichKienTap?.dotKienTap?.id === selectedDotId;
        });
    return currentList.length > 0 && currentList.every(r => r.da_khoa || r.da_khoa_thu_hoach);
  }, [reports, selectedDotId]);

  const lockDate = React.useMemo(() => {
    const r = reports.find(r => r.ngay_khoa_thu_hoach);
    return r?.ngay_khoa_thu_hoach ? new Date(r.ngay_khoa_thu_hoach).toLocaleDateString('vi-VN') : null;
  }, [reports]);

  const handleLockReports = async () => {
    if (reports.length === 0) return;
    const currentList = selectedDotId === 'ALL' 
      ? reports 
      : reports.filter(r => {
          const ctq = r.phieuThamQuan?.phieuDangKy?.chuyenThamQuan || r.phieuDangKy?.chuyenThamQuan;
          return ctq?.lichKienTap?.dotKienTap?.id === selectedDotId;
        });

    const unGraded = currentList.filter(r => r.diem_thu_hoach === null || r.diem_thu_hoach === undefined);
    if (unGraded.length > 0) {
      toast.error(`Còn ${unGraded.length} bài thu hoạch chưa được chấm điểm. Vui lòng chấm hết trước khi nộp lên Khoa.`);
      return;
    }

    try {
      const dotIdParam = selectedDotId !== 'ALL' ? selectedDotId : undefined;
      const res = await giangVienApi.lockGuidedReportsGrades({ dotKienTapId: dotIdParam });
      toast.success(res.data?.message || 'Đã khóa và nộp bảng điểm thu hoạch lên Khoa thành công!');
      if (lecturer) fetchReports(lecturer.id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi nộp bảng điểm lên Khoa');
      console.error(err);
    }
  };

  const uniqueDots = React.useMemo(() => {
    const dotsMap = new Map();
    reports.forEach(r => {
      const ctq = r.phieuThamQuan?.phieuDangKy?.chuyenThamQuan || r.phieuDangKy?.chuyenThamQuan;
      const dot = ctq?.lichKienTap?.dotKienTap;
      if (dot) {
        dotsMap.set(dot.id, dot.ten_dot);
      }
    });
    return Array.from(dotsMap.entries()).map(([id, name]) => ({ id, name }));
  }, [reports]);

  const uniqueTrips = React.useMemo(() => {
    const tripsMap = new Map();
    reports.forEach(r => {
      const ctq = r.phieuThamQuan?.phieuDangKy?.chuyenThamQuan || r.phieuDangKy?.chuyenThamQuan;
      const dot = ctq?.lichKienTap?.dotKienTap;
      if (ctq && (selectedDotId === 'ALL' || (dot && dot.id === selectedDotId))) {
        tripsMap.set(ctq.id, ctq.nhaMay?.ten_nha_may || 'Chuyến đi không tên');
      }
    });
    return Array.from(tripsMap.entries()).map(([id, name]) => ({ id, name }));
  }, [reports, selectedDotId]);

  const filteredReports = reports.filter(r => {
    const ctq = r.phieuThamQuan?.phieuDangKy?.chuyenThamQuan || r.phieuDangKy?.chuyenThamQuan;
    const sv = r.phieuThamQuan?.phieuDangKy?.sinhVien || r.phieuDangKy?.sinhVien || {};
    const nhaMay = ctq?.nhaMay?.ten_nha_may || '';
    const matchSearch = !searchTerm ||
      (sv.ho_ten && sv.ho_ten.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sv.mssv && sv.mssv.toLowerCase().includes(searchTerm.toLowerCase())) ||
      nhaMay.toLowerCase().includes(searchTerm.toLowerCase());

    const isGraded = r.diem_thu_hoach !== null;
    const matchStatus = selectedStatus === 'ALL' ||
      (selectedStatus === 'PENDING' && !isGraded) ||
      (selectedStatus === 'GRADED' && isGraded);

    const matchDot = selectedDotId === 'ALL' || ctq?.lichKienTap?.dotKienTap?.id === selectedDotId;
    const matchTrip = selectedTripId === 'ALL' || ctq?.id === selectedTripId;

    return matchSearch && matchStatus && matchDot && matchTrip;
  });

  const totalPages = Math.ceil(filteredReports.length / limit) || 1;
  const paginatedReports = filteredReports.slice((currentPage - 1) * limit, currentPage * limit);

  const groupedPaginatedReports = React.useMemo(() => {
    const groups = {};
    paginatedReports.forEach(report => {
      const ctq = report.phieuThamQuan?.phieuDangKy?.chuyenThamQuan || report.phieuDangKy?.chuyenThamQuan;
      const tripId = ctq?.id || 'unknown';
      const nhaMay = ctq?.nhaMay?.ten_nha_may || 'Chuyến đi khác';

      if (!groups[tripId]) {
        groups[tripId] = { nhaMay, reports: [] };
      }
      groups[tripId].reports.push(report);
    });
    return groups;
  }, [paginatedReports]);

  // ---------------------------------------------------------
  // VIEW 1: LIST OF REPORTS
  // ---------------------------------------------------------
  const renderReportList = () => (
    <div className="space-y-6">
      {/* Header & Back Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          {location.state?.filterMssv && (
            <button
              onClick={() => navigate('/giang-vien/guided-students')}
              className="flex items-center gap-1.5 text-slate-500 hover:text-[#407F3E] font-bold text-sm mb-2 transition-colors cursor-pointer w-fit"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại danh sách sinh viên hướng dẫn
            </button>
          )}
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            Danh sách Bài thu hoạch
          </h1>
        </div>

        {/* Lock / Submit Status & Action */}
        <div className="flex items-center gap-3">
          {isReportsLocked ? (
            <div className="px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Đã nộp bảng điểm lên Khoa {lockDate ? `ngày ${lockDate}` : ''}</span>
            </div>
          ) : (
            <button
              onClick={handleLockReports}
              disabled={reports.length === 0}
              className="px-5 py-2.5 bg-[#407F3E] hover:bg-[#407F3E]/90 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Lock className="w-4 h-4" />
              Khóa & Nộp bảng điểm thu hoạch
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-[#E7E0C4] px-2 mb-6 mt-4">
        {[
          { id: 'ALL', label: 'Tất cả bài nộp', count: reports.length },
          { id: 'PENDING', label: 'Chờ chấm', count: reports.filter(r => r.diem_thu_hoach === null).length },
          { id: 'GRADED', label: 'Đã chấm', count: reports.filter(r => r.diem_thu_hoach !== null).length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setSelectedStatus(tab.id);
              setCurrentPage(1);
            }}
            className={`pb-3 text-sm font-bold transition-all relative ${selectedStatus === tab.id
                ? 'text-[#407F3E]'
                : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            {tab.label} <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs ${selectedStatus === tab.id ? 'bg-[#407F3E]/10 text-[#407F3E]' : 'bg-slate-100 text-slate-500'}`}>{tab.count}</span>
            {selectedStatus === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#407F3E] rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E0C4] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
        <div className="flex-1 w-full flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm sinh viên, MSSV..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 border border-[#E7E0C4] rounded-lg text-sm focus:outline-none focus:border-[#407F3E] bg-slate-50/50 transition-colors hover:bg-white"
            />
          </div>
          {/* Dot Kien Tap Dropdown */}
          <div className="relative min-w-[160px] w-full sm:w-48" onClick={(e) => e.stopPropagation()}>
            <div
              onClick={() => { setIsDotDropdownOpen(!isDotDropdownOpen); setIsTripDropdownOpen(false); }}
              className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isDotDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
            >
              <span className="truncate pr-2 font-medium text-slate-700">
                {selectedDotId === 'ALL' ? 'Tất cả đợt' : uniqueDots.find(d => d.id === selectedDotId)?.name || 'Đợt kiến tập'}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
            {isDotDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1 flex flex-col min-w-[220px]">
                <div className="px-2 pb-1 border-b border-[#E7E0C4] mb-1">
                  <input
                    type="text"
                    placeholder="Tìm đợt..."
                    value={searchDotDropdown}
                    onChange={(e) => setSearchDotDropdown(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-[#E7E0C4] rounded-md text-xs focus:outline-none focus:border-[#407F3E] transition-colors"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  <div
                    onClick={() => { setSelectedDotId('ALL'); setSelectedTripId('ALL'); setIsDotDropdownOpen(false); setSearchDotDropdown(''); setCurrentPage(1); }}
                    className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${selectedDotId === 'ALL' ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                      }`}
                  >
                    <span>Tất cả đợt</span>
                    {selectedDotId === 'ALL' && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                  </div>
                  {uniqueDots
                    .filter(d => d.name.toLowerCase().includes(searchDotDropdown.toLowerCase()))
                    .map(d => (
                      <div
                        key={d.id}
                        onClick={() => { setSelectedDotId(d.id); setSelectedTripId('ALL'); setIsDotDropdownOpen(false); setSearchDotDropdown(''); setCurrentPage(1); }}
                        className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${selectedDotId === d.id ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                          }`}
                      >
                        <span className="truncate pr-2">{d.name}</span>
                        {selectedDotId === d.id && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                      </div>
                    ))}
                  {uniqueDots.filter(d => d.name.toLowerCase().includes(searchDotDropdown.toLowerCase())).length === 0 && (
                    <div className="px-4 py-2 text-xs text-slate-500 text-center">Không tìm thấy đợt</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Trip Dropdown */}
          <div className="relative min-w-[200px] w-full sm:w-56" onClick={(e) => e.stopPropagation()}>
            <div
              onClick={() => { setIsTripDropdownOpen(!isTripDropdownOpen); setIsDotDropdownOpen(false); }}
              className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all ${isTripDropdownOpen ? 'border-[#407F3E] ring-1 ring-[#407F3E]' : 'border-[#E7E0C4]'}`}
            >
              <span className="truncate pr-2 font-medium text-slate-700">
                {selectedTripId === 'ALL' ? 'Tất cả chuyến đi' : uniqueTrips.find(t => t.id === selectedTripId)?.name || 'Chuyến đi'}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
            {isTripDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-30 py-1 overflow-hidden animate-in slide-in-from-top-1 flex flex-col min-w-[250px]">
                <div className="px-2 pb-1 border-b border-[#E7E0C4] mb-1">
                  <input
                    type="text"
                    placeholder="Tìm chuyến đi..."
                    value={searchTripDropdown}
                    onChange={(e) => setSearchTripDropdown(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-[#E7E0C4] rounded-md text-xs focus:outline-none focus:border-[#407F3E] transition-colors"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  <div
                    onClick={() => { setSelectedTripId('ALL'); setIsTripDropdownOpen(false); setSearchTripDropdown(''); setCurrentPage(1); }}
                    className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${selectedTripId === 'ALL' ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                      }`}
                  >
                    <span>Tất cả chuyến đi</span>
                    {selectedTripId === 'ALL' && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                  </div>
                  {uniqueTrips
                    .filter(t => t.name.toLowerCase().includes(searchTripDropdown.toLowerCase()))
                    .map(t => (
                      <div
                        key={t.id}
                        onClick={() => { setSelectedTripId(t.id); setIsTripDropdownOpen(false); setSearchTripDropdown(''); setCurrentPage(1); }}
                        className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${selectedTripId === t.id ? 'bg-[#E7E0C4] text-slate-800 font-bold' : 'text-slate-700 hover:bg-[#E7E0C4]/50 font-medium'
                          }`}
                      >
                        <span className="truncate pr-2">{t.name}</span>
                        {selectedTripId === t.id && <Check className="w-4 h-4 text-[#407F3E] shrink-0" />}
                      </div>
                    ))}
                  {uniqueTrips.filter(t => t.name.toLowerCase().includes(searchTripDropdown.toLowerCase())).length === 0 && (
                    <div className="px-4 py-2 text-xs text-slate-500 text-center">Không tìm thấy chuyến đi</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          {selectedReportIds.length > 0 && (
            <button
              onClick={handleBulkAiGrading}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Chấm AI ({selectedReportIds.length})
            </button>
          )}
          <div className="text-xs text-slate-500 font-medium">
            Đang hiển thị: <span className="font-bold text-[#407F3E]">{filteredReports.length}</span> bài
          </div>
        </div>
      </div>

      {/* Table of Reports */}
      {paginatedReports.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center justify-center bg-white rounded-2xl border border-[#E7E0C4] border-dashed">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-1">Chưa có dữ liệu</h3>
          <p className="text-sm text-slate-500 max-w-sm">
            {reports.length === 0 ? 'Hiện chưa có bài thu hoạch nào được nộp.' : 'Không tìm thấy bài thu hoạch nào phù hợp với bộ lọc.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#E7E0C4] rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E7E0C4] text-xs uppercase tracking-wider text-slate-500 font-bold">
                  <th className="px-4 py-4 w-12 text-center">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-[#407F3E] rounded border-slate-300 focus:ring-[#407F3E] cursor-pointer"
                      checked={paginatedReports.length > 0 && paginatedReports.filter(r => r.diem_thu_hoach === null).length > 0 && selectedReportIds.length >= paginatedReports.filter(r => r.diem_thu_hoach === null).length}
                      onChange={(e) => {
                        const pendingIds = paginatedReports.filter(r => r.diem_thu_hoach === null).map(r => r.id);
                        if (e.target.checked) {
                          setSelectedReportIds(Array.from(new Set([...selectedReportIds, ...pendingIds])));
                        } else {
                          setSelectedReportIds(selectedReportIds.filter(id => !pendingIds.includes(id)));
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-4 min-w-[200px]">Sinh viên</th>
                  <th className="px-6 py-4 min-w-[180px]">Bài nộp</th>
                  <th className="px-4 py-4 text-center w-36">
                    <div className="inline-flex items-center gap-1.5 text-blue-600 font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Điểm AI</span>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-center w-40">Điểm GV</th>
                  <th className="px-4 py-4 text-center w-14"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E0C4]">
                {Object.values(groupedPaginatedReports).map((group, groupIdx) => (
                  <React.Fragment key={groupIdx}>
                    <tr className="bg-slate-100/50 border-y border-[#E7E0C4]">
                      <td colSpan="6" className="px-6 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-700 text-sm">{group.nhaMay}</span>
                          <span className="px-2 py-0.5 rounded-full bg-[#E7E0C4]/50 text-slate-600 text-[10px] uppercase font-bold tracking-wider">
                            {group.reports.length} bài
                          </span>
                        </div>
                      </td>
                    </tr>
                    {group.reports.map((report) => {
                      const isGraded = report.diem_thu_hoach !== null;
                      const hasAiGrade = report.diem_ai_de_xuat !== null && report.diem_ai_de_xuat !== undefined;
                      const sv = report.phieuThamQuan?.phieuDangKy?.sinhVien || report.phieuDangKy?.sinhVien || {};

                  return (
                    <tr 
                      key={report.id}
                      onClick={() => handleSelectReport(report)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-4 text-center" onClick={e => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-[#407F3E] rounded border-slate-300 focus:ring-[#407F3E] disabled:opacity-50 cursor-pointer"
                          disabled={isGraded}
                          checked={selectedReportIds.includes(report.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedReportIds([...selectedReportIds, report.id]);
                            else setSelectedReportIds(selectedReportIds.filter(id => id !== report.id));
                          }}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-bold text-slate-800 group-hover:text-[#407F3E] transition-colors">{sv.ho_ten}</p>
                          <p className="text-[11px] font-medium text-slate-500 mt-0.5">{sv.mssv}</p>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0 border border-red-100">
                            <FileText className="w-4 h-4 text-red-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-700 truncate max-w-[150px]">{report.file_url_bao_cao || 'BaoCao.pdf'}</p>
                            <p className="text-[10px] font-medium text-slate-400 mt-0.5">{new Date(report.ngay_nop).toLocaleDateString('vi-VN')}</p>
                          </div>
                        </div>
                      </td>

                      {/* Cột Điểm AI đề xuất */}
                      <td className="px-4 py-4 text-center" onClick={e => e.stopPropagation()}>
                        {hasAiGrade ? (
                          <div 
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs shadow-2xs hover:bg-blue-100 transition-colors cursor-default"
                            title={`AI đề xuất: ${report.diem_ai_de_xuat} điểm`}
                          >
                            <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="text-sm font-black">{report.diem_ai_de_xuat}</span>
                            <span className="text-[10px] font-semibold text-blue-500">/10</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-400 bg-slate-50 border border-slate-200/60">
                            Chưa chấm
                          </span>
                        )}
                      </td>

                      {/* Cột Điểm GV chính thức */}
                      <td className="px-4 py-4 text-center">
                        {isGraded ? (
                          <div className="flex flex-col items-center">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[#407F3E] font-bold text-xs shadow-2xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#407F3E] shrink-0" />
                              <span className="text-sm font-black text-[#407F3E]">{report.diem_thu_hoach}</span>
                              <span className="text-[10px] font-semibold text-[#407F3E]/70">/10</span>
                            </div>
                            <span className="text-[10px] font-medium text-emerald-600 mt-0.5">Đã chấm</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-[#DBD468]/20 text-[#B8A31D] border border-[#DBD468]/40 shadow-2xs">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#B8A31D] animate-pulse"></div> Chờ chấm
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-center">
                        <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 group-hover:bg-[#407F3E] group-hover:text-white transition-all ml-auto">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      <div className="p-4 border border-[#E7E0C4] bg-white rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
          <span>Hiển thị</span>
          <SearchableDropdown
            options={[
              { value: 15, label: '15' },
              { value: 30, label: '30' },
              { value: 50, label: '50' },
              { value: 100, label: '100' }
            ]}
            value={limit}
            onChange={(newLimit) => {
              setLimit(newLimit);
              setCurrentPage(1);
            }}
            searchPlaceholder="Tìm số lượng..."
            className="min-w-[80px]"
          />
          <span>/ {filteredReports.length} bài thu hoạch</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(1)}
            className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
          >
            Trang đầu
          </button>
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
          >
            Trước
          </button>
          <span className="px-4 py-1.5 rounded-lg bg-[#407F3E] text-white text-sm font-bold shadow-sm cursor-default mx-1">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
          >
            Sau
          </button>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(totalPages)}
            className="px-3 py-1.5 rounded-lg border border-[#E7E0C4] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-sm font-semibold transition-colors cursor-pointer"
          >
            Trang cuối
          </button>
        </div>
      </div>
    </div>
  );

  // ---------------------------------------------------------
  // VIEW 2: GRADING A SINGLE REPORT (PDF + Sidebar)
  // ---------------------------------------------------------
  const renderGradingView = () => {
    const sv = selectedReport.phieuThamQuan?.phieuDangKy?.sinhVien || selectedReport.phieuDangKy?.sinhVien || {};
    const nhaMay = selectedReport.phieuThamQuan?.phieuDangKy?.chuyenThamQuan?.nhaMay?.ten_nha_may || selectedReport.phieuDangKy?.chuyenThamQuan?.nhaMay?.ten_nha_may || 'Chuyến đi';

    return (
      <div className="h-[calc(100vh-64px)] flex flex-col animate-in fade-in zoom-in-95 duration-300">

        {/* Top Breadcrumb Bar */}
        <div className="h-14 bg-white border-b border-[#E7E0C4] flex items-center justify-between px-6 shrink-0 z-10 gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-600 min-w-0">
            <button
              onClick={() => setSelectedReport(null)}
              className="flex items-center gap-1.5 text-slate-500 hover:text-[#407F3E] transition-colors cursor-pointer mr-2 pr-4 border-r border-slate-200 shrink-0"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </button>
            <button onClick={() => setSelectedReport(null)} className="hover:text-[#407F3E] transition-colors shrink-0">
              Bài thu hoạch
            </button>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-[#407F3E] truncate">{nhaMay}</span>
          </div>

          {/* Tab Selector between Report and Confirmation Paper */}
          {confirmationFile && (
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setActiveViewerTab('report')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeViewerTab === 'report'
                    ? 'bg-white text-[#407F3E] shadow-xs'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Bài thu hoạch</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveViewerTab('confirmation')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeViewerTab === 'confirmation'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-indigo-600" />
                <span>Giấy xác nhận DN (Mộc đỏ)</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 flex overflow-hidden bg-[#E7E0C4]/20">

          {/* Left Side: Document Viewer */}
          <div className="flex-1 flex flex-col overflow-hidden relative">

            {/* Document Canvas (Actual File or Confirmation) */}
            <div className="flex-1 w-full h-full flex justify-center bg-slate-200">
              {activeViewerTab === 'report' ? (
                isLoadingText ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-500 w-full h-full">
                    <div className="w-8 h-8 border-4 border-[#E7E0C4] border-t-[#407F3E] rounded-full animate-spin mb-4"></div>
                    <p>Đang tải file báo cáo...</p>
                  </div>
                ) : pdfBlobUrl ? (
                  <iframe
                    src={pdfBlobUrl}
                    className="w-full h-full border-0"
                    title="Báo cáo PDF"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-slate-500">
                    {reportText || 'Không tìm thấy file PDF.'}
                  </div>
                )
              ) : (
                confirmationFile?.url ? (
                  confirmationFile.isImage ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-900/10 overflow-auto">
                      <div className="relative group max-w-2xl max-h-full">
                        <img 
                          src={confirmationFile.url} 
                          alt="Giấy xác nhận tham quan doanh nghiệp" 
                          className="max-h-[80vh] w-auto object-contain rounded-xl shadow-lg border border-slate-300 bg-white"
                        />
                        <a
                          href={confirmationFile.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute top-3 right-3 px-3 py-1.5 bg-black/75 hover:bg-black text-white text-xs font-bold rounded-lg backdrop-blur-sm transition-all flex items-center gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Mở ảnh gốc
                        </a>
                      </div>
                    </div>
                  ) : (
                    <iframe
                      src={confirmationFile.url}
                      className="w-full h-full border-0"
                      title="Giấy xác nhận doanh nghiệp"
                    />
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full text-slate-400 gap-2">
                    <Building2 className="w-10 h-10 text-slate-300" />
                    <span>Không tìm thấy file giấy xác nhận doanh nghiệp.</span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Right Side: Grading Sidebar */}
          <div className="w-full md:w-[350px] lg:w-[400px] bg-[#fdfcf8] border-l border-[#E7E0C4] flex flex-col shrink-0 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-20 overflow-y-auto custom-scrollbar p-5 space-y-5">

            {/* Student Info Card */}
            <div className="bg-white rounded-xl p-4 border border-[#E7E0C4] shadow-sm flex items-start gap-3">

              <div>
                <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1 flex items-center gap-2">
                  {sv.ho_ten}
                  {selectedReport.da_khoa && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E68A8C]/10 text-[#E68A8C] border border-[#E68A8C]/20">
                      <Lock className="w-3 h-3" /> Đã khóa
                    </span>
                  )}
                </h3>
                <p className="text-[11px] font-medium text-slate-500 mb-1">MSSV: {sv.mssv}</p>
                <p className="text-[11px] font-medium text-[#407F3E] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {nhaMay}
                </p>
              </div>
            </div>

            {/* AI Suggestion Card */}
            <div className="bg-[#E7E0C4]/40 rounded-xl p-5 border border-[#E7E0C4]">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#407F3E]" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">AI đề xuất điểm</h4>
              </div>

              {!aiGradingResult ? (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleAIGrading}
                    disabled={isGradingAI || selectedReport.da_khoa}
                    className="w-full flex justify-center items-center gap-2 text-sm font-bold text-white bg-[#407F3E] px-4 py-2.5 rounded-lg shadow-sm hover:bg-[#407F3E]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGradingAI ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang tiến hành chấm điểm
                      </>
                    ) : (
                      'Chấm tự động'
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex items-end justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-[#407F3E] leading-none">{aiGradingResult.diem_bao_cao_cuoi_cung}</span>
                      <span className="text-sm font-bold text-slate-500">/ 10</span>
                    </div>
                    <button
                      onClick={() => setIsAiModalOpen(true)}
                      className="text-[11px] font-bold text-[#407F3E] bg-white border border-[#E7E0C4] px-2.5 py-1.5 rounded-md hover:bg-[#fdfcf8] transition-colors shadow-sm cursor-pointer whitespace-nowrap"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Grading Form */}
            <form onSubmit={handleSaveGrade} className="bg-white rounded-xl p-5 border border-[#E7E0C4] shadow-sm flex-1">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-2">
                <Edit3Icon className="w-4 h-4 text-[#407F3E]" /> Đánh giá & Chấm điểm
              </h4>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
                    Điểm GVHD <span className="text-[#E68A8C]">*</span>
                  </label>
                  <div className="relative w-28">
                    <input
                      type="number" min="0" max="10" step="0.1"
                      disabled={selectedReport?.da_khoa || selectedReport?.da_khoa_thu_hoach}
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      placeholder="--"
                      required
                      className={`w-full px-3 py-2 border rounded-lg text-lg font-black transition-all text-center shadow-sm ${
                        selectedReport?.da_khoa || selectedReport?.da_khoa_thu_hoach
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-white border-slate-300 text-[#407F3E] focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E]'
                      }`}
                    />
                    <span className="absolute -right-8 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">/ 10</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Nhận xét chi tiết
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsExpandedComments(true)}
                        className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer hover:bg-slate-200 transition-colors"
                      >
                        <ZoomIn className="w-3 h-3" /> Phóng to
                      </button>
                      <button
                        type="button"
                        onClick={handleInsertTemplate}
                        disabled={selectedReport?.da_khoa || selectedReport?.da_khoa_thu_hoach}
                        className="text-[10px] font-bold text-[#407F3E] bg-[#89B449]/10 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer hover:bg-[#89B449]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Sparkles className="w-3 h-3" /> Chèn mẫu
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={6}
                    disabled={selectedReport?.da_khoa || selectedReport?.da_khoa_thu_hoach}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Nhận xét về nội dung, hình thức và tính thực tiễn của bài thu hoạch..."
                    className={`w-full px-4 py-3 border rounded-lg text-sm transition-all shadow-sm resize-none custom-scrollbar ${
                      selectedReport?.da_khoa || selectedReport?.da_khoa_thu_hoach
                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-white border-slate-300 text-slate-700 focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E]'
                    }`}
                  />
                </div>
              </div>

              <div className="mt-8 space-y-3">
                {selectedReport?.da_khoa || selectedReport?.da_khoa_thu_hoach ? (
                  <div className="w-full py-3 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    Đã nộp điểm lên Khoa
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> Lưu điểm
                  </button>
                )}
              </div>

            </form>

          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={selectedReport ? '' : 'bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300'}
      onClick={() => { setIsTripDropdownOpen(false); setIsDotDropdownOpen(false); }}
    >
      {selectedReport ? renderGradingView() : renderReportList()}

      {/* AI Grading Details Modal */}
      {isAiModalOpen && aiGradingResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#E7E0C4] bg-[#fdfcf8] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#89B449]/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#407F3E]" />
                </div>
                <h2 className="font-bold text-slate-800">Phân tích & Đề xuất từ AI</h2>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto max-h-[75vh] custom-scrollbar space-y-6">

              {/* Overview */}
              <div className="flex gap-6 items-center">
                <div className="shrink-0 flex flex-col items-center justify-center w-28 h-28 rounded-full border-4 border-[#89B449]/30 bg-[#fdfcf8]">
                  <span className="text-3xl font-black text-[#407F3E]">{aiGradingResult.diem_bao_cao_cuoi_cung}</span>
                  <span className="text-xs font-bold text-slate-500 uppercase">/ 10 Điểm</span>
                </div>
                <div className="flex-1 bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                  <h4 className="text-xs font-bold text-blue-800 uppercase mb-2">Nhận xét tổng quan</h4>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    AI đã chấm điểm xong. Dưới đây là kết quả chi tiết từng phần theo cấu trúc Rubric.
                  </p>
                </div>
              </div>

              <hr className="border-[#E7E0C4]" />

              {/* Detailed Breakdown */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase mb-4">Chi tiết theo tiêu chí</h4>
                <div className="space-y-3">

                  {/* Hình thức */}
                  <div className="p-4 border border-[#E7E0C4] rounded-xl bg-white shadow-sm hover:shadow transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-bold text-slate-800 text-sm">Hình thức trình bày</h5>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-[#89B449]/10 text-[#407F3E]">
                        {isNaN(Number(aiGradingResult?.hinh_thuc_tong_quan?.diem_hinh_thuc))
                          ? (aiGradingResult?.hinh_thuc_tong_quan?.diem_hinh_thuc || 'Đạt')
                          : `${aiGradingResult.hinh_thuc_tong_quan.diem_hinh_thuc} / 10 đ`}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{aiGradingResult?.hinh_thuc_tong_quan?.ly_do_hinh_thuc}</p>
                  </div>

                  {/* Tổng quan */}
                  <div className="p-4 border border-[#E7E0C4] rounded-xl bg-white shadow-sm hover:shadow transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-bold text-slate-800 text-sm">Tổng quan về nhà máy/công ty</h5>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-[#89B449]/10 text-[#407F3E]">
                        {isNaN(Number(aiGradingResult?.hinh_thuc_tong_quan?.diem_tong_quan))
                          ? (aiGradingResult?.hinh_thuc_tong_quan?.diem_tong_quan || 'Đạt')
                          : `${aiGradingResult.hinh_thuc_tong_quan.diem_tong_quan} / 10 đ`}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{aiGradingResult?.hinh_thuc_tong_quan?.ly_do_tong_quan}</p>
                  </div>

                  {/* Quy trình công nghệ */}
                  <div className="p-4 border border-[#E7E0C4] rounded-xl bg-white shadow-sm hover:shadow transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-bold text-slate-800 text-sm">Thuyết minh quy trình công nghệ</h5>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-[#89B449]/10 text-[#407F3E]">
                        {isNaN(Number(aiGradingResult?.quy_trinh_cong_nghe?.diem_quy_trinh))
                          ? (aiGradingResult?.quy_trinh_cong_nghe?.diem_quy_trinh || 'Đạt')
                          : `${aiGradingResult.quy_trinh_cong_nghe.diem_quy_trinh} / 10 đ`}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{aiGradingResult?.quy_trinh_cong_nghe?.ly_do_quy_trinh}</p>
                  </div>

                  {/* VSATTP */}
                  <div className="p-4 border border-[#E7E0C4] rounded-xl bg-white shadow-sm hover:shadow transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-bold text-slate-800 text-sm">Đánh giá thực trạng VSATTP</h5>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-[#89B449]/10 text-[#407F3E]">
                        {isNaN(Number(aiGradingResult?.vsattp?.diem_vsattp))
                          ? (aiGradingResult?.vsattp?.diem_vsattp || 'Đạt')
                          : `${aiGradingResult.vsattp.diem_vsattp} / 10 đ`}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{aiGradingResult?.vsattp?.ly_do_vsattp}</p>
                  </div>

                </div>
              </div>

              <hr className="border-[#E7E0C4]" />

              {/* Autograded text content */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase mb-4">Nội dung được tự động chấm</h4>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-mono whitespace-pre-wrap h-64 overflow-y-auto custom-scrollbar shadow-inner">
                  {reportText || "Không có nội dung."}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#E7E0C4] bg-slate-50 flex items-center justify-between shrink-0">
              <button
                onClick={() => {
                  setAiGradingResult(null);
                  setIsAiModalOpen(false);
                }}
                className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Thực hiện chấm lại
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsAiModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    setScore(aiGradingResult.diem_bao_cao_cuoi_cung);
                    setComments(
                      `1. Hình thức: ${aiGradingResult.hinh_thuc_tong_quan.ly_do_hinh_thuc}
` +
                      `2. Tổng quan: ${aiGradingResult.hinh_thuc_tong_quan.ly_do_tong_quan}
` +
                      `3. Quy trình: ${aiGradingResult.quy_trinh_cong_nghe.ly_do_quy_trinh}
` +
                      `4. VSATTP: ${aiGradingResult.vsattp.ly_do_vsattp}`
                    );
                    setIsAiModalOpen(false);
                    toast.success('Đã áp dụng đề xuất của AI vào form!');
                  }}
                  className="px-5 py-2.5 rounded-lg bg-[#407F3E] text-white font-bold text-sm shadow-md hover:bg-[#407F3E]/90 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" /> Sử dụng đề xuất này
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Floating Background Progress Widget (Non-blocking) */}
      {isBulkAiRunning && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          {isBulkAiMinimized ? (
            /* Minimized Pill View */
            <div
              onClick={() => setIsBulkAiMinimized(false)}
              className="bg-white/95 backdrop-blur-md border border-[#E7E0C4] shadow-2xl rounded-full px-4 py-2.5 flex items-center gap-3 cursor-pointer hover:border-[#407F3E] transition-all group"
            >
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              </div>
              <div className="text-xs font-bold text-slate-700">
                {bulkAiIsCompleted ? (
                  <span className="text-[#407F3E] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Hoàn tất ({bulkAiProgress}/{bulkAiTotal})
                  </span>
                ) : (
                  <span>AI đang chấm: <strong className="text-[#407F3E]">{bulkAiProgress}/{bulkAiTotal}</strong> bài</span>
                )}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setIsBulkAiMinimized(false); }}
                className="text-slate-400 group-hover:text-slate-700 p-0.5 rounded transition-colors cursor-pointer"
                title="Mở rộng chi tiết"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              {bulkAiIsCompleted && (
                <button
                  onClick={(e) => { e.stopPropagation(); setIsBulkAiRunning(false); }}
                  className="text-slate-400 hover:text-red-500 p-0.5 rounded transition-colors cursor-pointer"
                  title="Đóng"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            /* Expanded Card View */
            <div className="bg-white/95 backdrop-blur-md w-96 rounded-2xl shadow-2xl border border-[#E7E0C4] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="px-5 py-3.5 border-b border-[#E7E0C4] bg-slate-50/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">Chấm điểm AI hàng loạt</h3>
                    <p className="text-[10px] text-slate-500 font-medium">Tiến trình đang chạy ngầm</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsBulkAiMinimized(true)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                    title="Thu nhỏ xuống góc màn hình"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  {bulkAiIsCompleted && (
                    <button
                      onClick={() => setIsBulkAiRunning(false)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Đóng"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1.5 font-medium">
                    <span className="text-slate-600">Tiến độ hoàn thành:</span>
                    <span className="font-bold text-[#407F3E] font-mono">{bulkAiProgress} / {bulkAiTotal} bài</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#89B449] to-[#407F3E] h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${(bulkAiTotal > 0 ? bulkAiProgress / bulkAiTotal : 0) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
                  <p className="font-bold text-slate-800 truncate flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{bulkAiCurrentStudent || 'Đang chuẩn bị...'}</span>
                  </p>
                  <p className="text-slate-500 text-[11px] animate-pulse pl-5">{bulkAiStatusText}</p>
                </div>
              </div>

              {/* Footer Action */}
              <div className="px-4 py-3 border-t border-[#E7E0C4] bg-slate-50/50 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 italic">
                  {bulkAiIsCompleted ? 'Đã xong toàn bộ' : 'Bạn có thể đọc & chấm bài khác'}
                </span>
                {bulkAiIsCompleted ? (
                  <button
                    onClick={() => setIsBulkAiRunning(false)}
                    className="px-4 py-1.5 rounded-lg bg-[#407F3E] text-white text-xs font-bold hover:bg-[#407F3E]/90 transition-colors shadow-sm cursor-pointer"
                  >
                    Đóng
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      isBulkAiCanceled.current = true;
                      setBulkAiStatusText('Đang dừng tiến trình...');
                    }}
                    className="px-3.5 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    Hủy tiến trình
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Expanded Comments Modal */}
      {isExpandedComments && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl h-[80vh] rounded-2xl shadow-xl flex flex-col">
            <div className="px-6 py-4 border-b border-[#E7E0C4] bg-[#fdfcf8] flex items-center justify-between shrink-0">
              <h2 className="font-bold text-slate-800 text-lg">Nhận xét chi tiết</h2>
              <button
                onClick={() => setIsExpandedComments(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Nhận xét về nội dung, hình thức và tính thực tiễn của bài thu hoạch..."
                className="w-full h-full p-4 bg-slate-50 border border-slate-300 rounded-xl text-base focus:outline-none focus:border-[#407F3E] focus:ring-2 focus:ring-[#407F3E]/20 transition-all text-slate-700 shadow-inner resize-none custom-scrollbar"
              />
            </div>
            <div className="px-6 py-4 border-t border-[#E7E0C4] bg-slate-50 flex items-center justify-end shrink-0 gap-3">
              <button
                onClick={handleInsertTemplate}
                className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#407F3E]" /> Chèn mẫu
              </button>
              <button
                onClick={() => setIsExpandedComments(false)}
                className="px-6 py-2.5 rounded-lg bg-[#407F3E] text-white font-bold text-sm shadow-md hover:bg-[#407F3E]/90 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" /> Hoàn tất
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Missing icon component definition for the new UI
const Edit3Icon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 20h9"></path>
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
  </svg>
);
