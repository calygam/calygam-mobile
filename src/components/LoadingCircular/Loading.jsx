import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';

const CircularLoader = ({ size = 80, strokeWidth = 4, color = '#999' }) => {
    const rotation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animate = () => {
            Animated.loop(
                Animated.timing(rotation, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();
        };
        animate();
    }, [rotation]);

    const spin = rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Animated.View
                style={[
                    styles.loader,
                    {
                        borderWidth: strokeWidth,
                        borderColor: color,
                        borderRightColor: 'transparent',
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        transform: [{ rotate: spin }],
                    },
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loader: {
        borderStyle: 'solid',
        borderRightColor: 'transparent',
    },
});

export default CircularLoader;