// This is a basic Flutter widget test.
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/data/state/app_state.dart';
import 'package:mobile/main.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(
      const AppStateContainer(
        child: MainApp(),
      ),
    );

    // Verify that the login screen is loaded by checking for some UI elements
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
