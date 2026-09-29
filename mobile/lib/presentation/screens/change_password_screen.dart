import 'package:flutter/material.dart';
import '../../core/network/api_service.dart';
import '../../core/theme/app_theme.dart';
import '../../data/state/app_state.dart';
import '../widgets/app_snackbar.dart';

class ChangePasswordScreen extends StatefulWidget {
  const ChangePasswordScreen({super.key});

  @override
  State<ChangePasswordScreen> createState() => _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends State<ChangePasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  
  String _oldPass = '';
  String _newPass = '';
  String _confirmPass = '';
  
  bool _showOld = false;
  bool _showNew = false;
  bool _showConfirm = false;
  
  bool _loading = false;
  bool _success = false;

  bool get _hasMinLength => _newPass.length >= 8;
  bool get _hasUpperCase => _newPass.contains(RegExp(r'[A-Z]'));
  bool get _hasLowerCase => _newPass.contains(RegExp(r'[a-z]'));
  bool get _hasNumber => _newPass.contains(RegExp(r'[0-9]'));
  bool get _isMatch => _newPass == _confirmPass && _confirmPass.isNotEmpty;
  
  bool get _isValid => _hasMinLength && _hasUpperCase && _hasLowerCase && _hasNumber && _isMatch;

  Future<void> _handleSubmit() async {
    if (!_isValid) return;
    
    setState(() => _loading = true);
    try {
      await ApiService.changePassword(_oldPass, _newPass);
      
      setState(() {
        _success = true;
      });
      
      // Update app state and navigate to portal
      Future.delayed(const Duration(seconds: 2), () {
        if (mounted) {
           final appStateProvider = AppStateProvider.of(context);
           appStateProvider.completePasswordChange();
        }
      });
      
    } catch (e) {
      if (mounted) {
        AppSnackBar.showError(context, e.toString().replaceAll('Exception: ', ''));
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _logout() {
    AppStateProvider.of(context).logout();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.appBackground,
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Container(
            width: double.infinity,
            constraints: const BoxConstraints(maxWidth: 400),
            padding: const EdgeInsets.all(24.0),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                )
              ],
            ),
            child: _success ? _buildSuccess() : _buildForm(),
          ),
        ),
      ),
    );
  }

  Widget _buildSuccess() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 60,
          height: 60,
          decoration: BoxDecoration(
            color: AppColors.primary.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: const Icon(Icons.check, color: AppColors.primary, size: 32),
        ),
        const SizedBox(height: 24),
        const Text(
          'Đổi mật khẩu thành công!',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppColors.darkSlate,
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'Đang chuyển hướng vào hệ thống...',
          style: TextStyle(
            fontSize: 13,
            color: AppColors.textMuted,
          ),
        ),
      ],
    );
  }

  Widget _buildForm() {
    return Form(
      key: _formKey,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Icon(Icons.key, color: AppColors.primary, size: 28),
          ),
          const SizedBox(height: 16),
          const Text(
            'Yêu cầu đổi mật khẩu',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w900,
              color: AppColors.darkSlate,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Tài khoản của bạn đang sử dụng mật khẩu mặc định. Vui lòng đổi mật khẩu mới để tiếp tục.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 12,
              color: AppColors.textMuted,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 24),
          
          _buildPasswordField(
            label: 'Mật khẩu hiện tại (Mặc định)',
            value: _oldPass,
            onChanged: (val) => setState(() => _oldPass = val),
            showObscure: _showOld,
            onToggleObscure: () => setState(() => _showOld = !_showOld),
          ),
          const SizedBox(height: 16),
          
          _buildPasswordField(
            label: 'Mật khẩu mới',
            value: _newPass,
            onChanged: (val) => setState(() => _newPass = val),
            showObscure: _showNew,
            onToggleObscure: () => setState(() => _showNew = !_showNew),
          ),
          const SizedBox(height: 16),
          
          _buildPasswordField(
            label: 'Xác nhận mật khẩu mới',
            value: _confirmPass,
            onChanged: (val) => setState(() => _confirmPass = val),
            showObscure: _showConfirm,
            onToggleObscure: () => setState(() => _showConfirm = !_showConfirm),
          ),
          const SizedBox(height: 24),
          
          _buildRequirementsList(),
          const SizedBox(height: 24),
          
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton(
              onPressed: _isValid && !_loading ? _handleSubmit : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 0,
              ),
              child: _loading 
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Text('Cập nhật mật khẩu', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: OutlinedButton.icon(
              onPressed: _logout,
              icon: const Icon(Icons.logout, size: 18),
              label: const Text('Đăng xuất'),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.textMuted,
                side: BorderSide(color: Colors.grey.shade300),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPasswordField({
    required String label,
    required String value,
    required Function(String) onChanged,
    required bool showObscure,
    required VoidCallback onToggleObscure,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.textMuted, letterSpacing: 0.5),
        ),
        const SizedBox(height: 6),
        TextFormField(
          obscureText: !showObscure,
          onChanged: onChanged,
          style: const TextStyle(fontSize: 14),
          decoration: InputDecoration(
            hintText: 'Nhập $label',
            suffixIcon: IconButton(
              icon: Icon(showObscure ? Icons.visibility_off : Icons.visibility, color: Colors.grey, size: 20),
              onPressed: onToggleObscure,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildRequirementsList() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.appBackground.withOpacity(0.5),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.primary.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'YÊU CẦU MẬT KHẨU PHỨC TẠP:',
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.primary, letterSpacing: 0.5),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 12,
            runSpacing: 8,
            children: [
              _buildRequirementItem('Tối thiểu 8 ký tự', _hasMinLength),
              _buildRequirementItem('Ít nhất 1 chữ hoa (A-Z)', _hasUpperCase),
              _buildRequirementItem('Ít nhất 1 chữ thường (a-z)', _hasLowerCase),
              _buildRequirementItem('Ít nhất 1 chữ số (0-9)', _hasNumber),
              _buildRequirementItem('Mật khẩu xác nhận trùng khớp', _isMatch),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRequirementItem(String text, bool isMet) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 6,
          height: 6,
          decoration: BoxDecoration(
            color: isMet ? AppColors.primary : Colors.red.shade300,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 6),
        Text(
          text,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: isMet ? AppColors.primary : AppColors.textMuted,
          ),
        ),
      ],
    );
  }
}
