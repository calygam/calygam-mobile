# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html
# Reanimated
-keep class com.swmansion.reanimated.** { *; }
-dontwarn com.swmansion.reanimated.**

# Gesture Handler
-keep class com.swmansion.gesturehandler.** { *; }
-dontwarn com.swmansion.gesturehandler.**

# Async Storage
-keep class com.reactnativecommunity.asyncstorage.** { *; }
-dontwarn com.reactnativecommunity.asyncstorage.**

# Safe Area Context
-keep class com.th3rdwave.safeareacontext.** { *; }
-dontwarn com.th3rdwave.safeareacontext.**

# Screens
-keep class com.swmansion.rnscreens.** { *; }
-dontwarn com.swmansion.rnscreens.**

# SVG
-keep class com.horcrux.svg.** { *; }
-dontwarn com.horcrux.svg.**

# Firebase e Google Sign-In
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

# Navigation
-keep class com.reactnavigation.** { *; }
-dontwarn com.reactnavigation.**

# Bottom Sheet
-keep class com.gorhom.bottomsheet.** { *; }
-dontwarn com.gorhom.bottomsheet.**

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# Add any project specific keep options here:
