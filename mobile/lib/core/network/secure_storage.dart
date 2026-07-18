import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class SecureStorage {
  static const String _keyPrefix = 'secure_';
  // Secret key used for basic XOR encryption of values on disk
  static const int _xorKey = 0x5A; 

  static String _encrypt(String value) {
    final bytes = utf8.encode(value);
    final encryptedBytes = bytes.map((b) => b ^ _xorKey).toList();
    return base64.encode(encryptedBytes);
  }

  static String _decrypt(String encryptedBase64) {
    try {
      final encryptedBytes = base64.decode(encryptedBase64);
      final decryptedBytes = encryptedBytes.map((b) => b ^ _xorKey).toList();
      return utf8.decode(decryptedBytes);
    } catch (e) {
      return '';
    }
  }

  static Future<void> write(String key, String value) async {
    final prefs = await SharedPreferences.getInstance();
    final encryptedValue = _encrypt(value);
    await prefs.setString('$_keyPrefix$key', encryptedValue);
  }

  static Future<String?> read(String key) async {
    final prefs = await SharedPreferences.getInstance();
    final encryptedValue = prefs.getString('$_keyPrefix$key');
    if (encryptedValue == null || encryptedValue.isEmpty) {
      return null;
    }
    return _decrypt(encryptedValue);
  }

  static Future<void> delete(String key) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('$_keyPrefix$key');
  }

  static Future<void> clearAll() async {
    final prefs = await SharedPreferences.getInstance();
    final keys = prefs.getKeys();
    for (String key in keys) {
      if (key.startsWith(_keyPrefix)) {
        await prefs.remove(key);
      }
    }
  }
}
