import toast from 'react-hot-toast';
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, FileText, CheckCircle2, Save, Search, ChevronRight,
  ZoomIn, ZoomOut, Download, Sparkles, MessageSquareWarning, User,
  Filter, Check, ChevronDown, X
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api, { giangVienApi } from '../../services/api';

export default function ChamBaiThuHoach_GV() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [lecturer, setLecturer] = useState(null);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  // Filter & Pagination states
  const [searchTerm, setSearchTerm] = useState(location.state?.filterMssv || '');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [searchStatusDropdown, setSearchStatusDropdown] = useState('');
  const statusDropdownRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(15);

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isGradingAI, setIsGradingAI] = useState(false);
  const [aiGradingResult, setAiGradingResult] = useState(null);
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

  const TEMPLATE_COMMENT = `1. Giới thiệu tổng quan nhà máy: ...
2. Thuyết minh quy trình công nghệ sản xuất: ...
3. Đánh giá thực trạng điều kiện đảm bảo VSATTP: ...`;

  const handleInsertTemplate = () => {
    setComments(prev => prev ? prev + '\n\n' + TEMPLATE_COMMENT : TEMPLATE_COMMENT);
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
    setScore(report.diem_thu_hoach !== null ? report.diem_thu_hoach : '');
    setComments(report.nhan_xet_cua_giang_vien || '');

    if (report.file_bao_cao) {
      setIsLoadingText(true);
      setReportText('');
      setPdfBlobUrl(null);
      try {
        let apiPath = report.file_bao_cao;
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

  const filteredReports = reports.filter(r => {
    const sv = r.phieuThamQuan?.phieuDangKy?.sinhVien || r.phieuDangKy?.sinhVien || {};
    const nhaMay = r.phieuThamQuan?.phieuDangKy?.chuyenThamQuan?.nhaMay?.ten_nha_may || r.phieuDangKy?.chuyenThamQuan?.nhaMay?.ten_nha_may || '';
    const matchSearch = !searchTerm || 
      (sv.ho_ten && sv.ho_ten.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sv.mssv && sv.mssv.toLowerCase().includes(searchTerm.toLowerCase())) ||
      nhaMay.toLowerCase().includes(searchTerm.toLowerCase());
    
    const isGraded = r.diem_thu_hoach !== null;
    const matchStatus = selectedStatus === 'ALL' || 
      (selectedStatus === 'PENDING' && !isGraded) || 
      (selectedStatus === 'GRADED' && isGraded);

    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredReports.length / limit) || 1;
  const paginatedReports = filteredReports.slice((currentPage - 1) * limit, currentPage * limit);

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
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E0C4] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm sinh viên, MSSV, nhà máy..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 border border-[#E7E0C4] rounded-lg text-sm focus:outline-none focus:border-[#407F3E] bg-slate-50/50"
            />
          </div>

          {/* Popover Dropdown Status */}
          <div className="relative" ref={statusDropdownRef}>
            <button
              type="button"
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className="w-full sm:w-56 px-3.5 py-2 border border-[#E7E0C4] rounded-lg text-sm font-medium bg-slate-50/50 text-slate-700 flex items-center justify-between hover:bg-slate-100 transition-colors shadow-sm"
            >
              <div className="flex items-center gap-2 truncate">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">
                  {selectedStatus === 'ALL' && 'Tất cả trạng thái'}
                  {selectedStatus === 'PENDING' && 'Chờ chấm'}
                  {selectedStatus === 'GRADED' && 'Đã chấm'}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isStatusDropdownOpen && (
              <div className="absolute left-0 right-0 sm:right-auto sm:w-56 mt-1 bg-white border border-[#E7E0C4] rounded-lg shadow-lg z-50 py-1 flex flex-col">
                <div className="px-2 pb-1 border-b border-[#E7E0C4] mb-1">
                  <input 
                    type="text" 
                    placeholder="Tìm trạng thái..." 
                    value={searchStatusDropdown}
                    onChange={(e) => setSearchStatusDropdown(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-[#E7E0C4] rounded-md text-xs focus:outline-none focus:border-[#407F3E] transition-colors"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {[
                    { value: 'ALL', label: 'Tất cả trạng thái' },
                    { value: 'PENDING', label: 'Chờ chấm' },
                    { value: 'GRADED', label: 'Đã chấm' }
                  ]
                    .filter(opt => opt.label.toLowerCase().includes(searchStatusDropdown.toLowerCase()))
                    .map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setSelectedStatus(opt.value);
                          setIsStatusDropdownOpen(false);
                          setSearchStatusDropdown('');
                          setCurrentPage(1);
                        }}
                        className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between hover:bg-slate-50 transition-colors ${selectedStatus === opt.value ? 'bg-[#E7E0C4]/40 font-bold text-[#407F3E]' : 'text-slate-700'}`}
                      >
                        <span>{opt.label}</span>
                        {selectedStatus === opt.value && <Check className="w-4 h-4 text-[#407F3E]" />}
                      </button>
                    ))}
                  {[
                    { value: 'ALL', label: 'Tất cả trạng thái' },
                    { value: 'PENDING', label: 'Chờ chấm' },
                    { value: 'GRADED', label: 'Đã chấm' }
                  ].filter(opt => opt.label.toLowerCase().includes(searchStatusDropdown.toLowerCase())).length === 0 && (
                    <div className="px-4 py-2 text-xs text-slate-500 text-center">Không tìm thấy</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Tìm thấy: <span className="font-bold text-slate-700">{filteredReports.length}</span> bài nộp
        </div>
      </div>

      {/* Grid of Report Cards */}
      {paginatedReports.length === 0 ? (
        <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-[#E7E0C4]">
          {reports.length === 0 ? 'Không có bài thu hoạch nào.' : 'Không tìm thấy bài thu hoạch nào phù hợp với bộ lọc.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedReports.map((report) => {
            const isGraded = report.diem_thu_hoach !== null;
            const sv = report.phieuThamQuan?.phieuDangKy?.sinhVien || report.phieuDangKy?.sinhVien || {};
            const nhaMay = report.phieuThamQuan?.phieuDangKy?.chuyenThamQuan?.nhaMay?.ten_nha_may || report.phieuDangKy?.chuyenThamQuan?.nhaMay?.ten_nha_may || 'Chuyến đi';
            
            return (
              <div 
                key={report.id} 
                onClick={() => handleSelectReport(report)}
                className="bg-white border border-[#E7E0C4] rounded-2xl overflow-hidden shadow-sm hover:border-[#407F3E] hover:shadow-md transition-all cursor-pointer group flex flex-col h-full"
              >
                {/* Card Header */}
                <div className={`px-6 py-4 border-b border-[#E7E0C4] flex items-center justify-between ${isGraded ? 'bg-slate-50/50' : 'bg-[#DBD468]/10'}`}>
                  <div className="flex items-center gap-3 truncate">
                    <h2 className="font-black text-slate-800 text-lg group-hover:text-[#407F3E] transition-colors truncate">{nhaMay}</h2>
                  </div>
                </div>
                
                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-[#E7E0C4]/30 text-[#407F3E] font-bold border border-[#E7E0C4] flex items-center justify-center shrink-0">
                        {sv.ho_ten?.charAt(0) || <User className="w-4 h-4"/>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{sv.ho_ten}</p>
                        <p className="text-[10px] font-medium text-slate-500">MSSV: {sv.mssv}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái:</span>
                      {isGraded ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-[#89B449]/10 text-[#407F3E]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đã chấm ({report.diem_thu_hoach}/10)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-[#DBD468] text-slate-800 shadow-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-800 animate-pulse"></div> Chờ chấm
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 mb-6">
                      <FileText className="w-8 h-8 text-[#407F3E]" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-700 truncate">{report.file_url_bao_cao || 'BaoCao.pdf'}</p>
                        <p className="text-[10px] font-medium text-slate-400 mt-0.5">{new Date(report.ngay_nop).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end text-[#407F3E] font-bold text-sm mt-4">
                    {isGraded ? 'Xem lại bài làm' : 'Bắt đầu chấm bài'} <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      <div className="p-4 border border-[#E7E0C4] bg-white rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
          <span>Hiển thị</span>
          <select 
            value={limit}
            onChange={(e) => {
              const newLimit = Number(e.target.value);
              setLimit(newLimit);
              setCurrentPage(1);
            }}
            className="border border-[#E7E0C4] rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-[#407F3E] text-slate-700 cursor-pointer shadow-sm"
          >
            <option value={15}>15</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
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
        <div className="h-14 bg-white border-b border-[#E7E0C4] flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
            <button 
              onClick={() => setSelectedReport(null)}
              className="flex items-center gap-1.5 text-slate-500 hover:text-[#407F3E] transition-colors cursor-pointer mr-2 pr-4 border-r border-slate-200"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </button>
            <button onClick={() => setSelectedReport(null)} className="hover:text-[#407F3E] transition-colors">
              Bài thu hoạch
            </button>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="text-[#407F3E]">{nhaMay}</span>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden bg-[#E7E0C4]/20">
          
          {/* Left Side: Document Viewer */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            
            {/* PDF Canvas (Actual File) */}
            <div className="flex-1 w-full h-full flex justify-center bg-slate-200">
              {isLoadingText ? (
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
              )}
            </div>
          </div>

          {/* Right Side: Grading Sidebar */}
          <div className="w-full md:w-[350px] lg:w-[400px] bg-[#fdfcf8] border-l border-[#E7E0C4] flex flex-col shrink-0 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-20 overflow-y-auto custom-scrollbar p-5 space-y-5">
            
            {/* Student Info Card */}
            <div className="bg-white rounded-xl p-4 border border-[#E7E0C4] shadow-sm flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-[#E7E0C4]/30 text-[#407F3E] font-bold border border-[#E7E0C4] flex items-center justify-center shrink-0 text-lg">
                {sv.ho_ten?.charAt(0) || 'S'}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1">{sv.ho_ten}</h3>
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
                    disabled={isGradingAI}
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
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      placeholder="--"
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-lg focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] font-black text-[#407F3E] transition-all text-center shadow-sm"
                    />
                    <span className="absolute -right-8 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">/ 10</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Nhận xét chi tiết
                    </label>
                    <button 
                      type="button" 
                      onClick={handleInsertTemplate}
                      className="text-[10px] font-bold text-[#407F3E] bg-[#89B449]/10 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer hover:bg-[#89B449]/20 transition-colors"
                    >
                      <Sparkles className="w-3 h-3" /> Chèn mẫu
                    </button>
                  </div>
                  <textarea 
                    rows={6}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Nhận xét về nội dung, hình thức và tính thực tiễn của bài thu hoạch..."
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#407F3E] focus:ring-1 focus:ring-[#407F3E] transition-all text-slate-700 shadow-sm resize-none custom-scrollbar"
                  />
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <button 
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#407F3E] text-white hover:bg-[#407F3E]/90 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Lưu điểm
                </button>
              </div>

            </form>

          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={selectedReport ? '' : 'bg-[#E7E0C4]/20 min-h-[calc(100vh-80px)] p-6 animate-in fade-in duration-300'}>
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
                        {aiGradingResult.hinh_thuc_tong_quan.diem_hinh_thuc} / 10 đ
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{aiGradingResult.hinh_thuc_tong_quan.ly_do_hinh_thuc}</p>
                  </div>

                  {/* Tổng quan */}
                  <div className="p-4 border border-[#E7E0C4] rounded-xl bg-white shadow-sm hover:shadow transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-bold text-slate-800 text-sm">Tổng quan về nhà máy/công ty</h5>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-[#89B449]/10 text-[#407F3E]">
                        {aiGradingResult.hinh_thuc_tong_quan.diem_tong_quan} / 10 đ
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{aiGradingResult.hinh_thuc_tong_quan.ly_do_tong_quan}</p>
                  </div>

                  {/* Quy trình công nghệ */}
                  <div className="p-4 border border-[#E7E0C4] rounded-xl bg-white shadow-sm hover:shadow transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-bold text-slate-800 text-sm">Thuyết minh quy trình công nghệ</h5>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-[#89B449]/10 text-[#407F3E]">
                        {aiGradingResult.quy_trinh_cong_nghe.diem_quy_trinh} / 10 đ
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{aiGradingResult.quy_trinh_cong_nghe.ly_do_quy_trinh}</p>
                  </div>

                  {/* VSATTP */}
                  <div className="p-4 border border-[#E7E0C4] rounded-xl bg-white shadow-sm hover:shadow transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-bold text-slate-800 text-sm">Đánh giá thực trạng VSATTP</h5>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-[#89B449]/10 text-[#407F3E]">
                        {aiGradingResult.vsattp.diem_vsattp} / 10 đ
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{aiGradingResult.vsattp.ly_do_vsattp}</p>
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
