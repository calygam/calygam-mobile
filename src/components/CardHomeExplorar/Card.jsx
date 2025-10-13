import { View, Text, StyleSheet} from 'react-native'
import React from 'react'
import Svg from 'react-native-svg'



export default function Cards({ title, Icon }) {
  return (
    <View style={styles.Card}>
      <View style={styles.iconContainer}>
        <Icon width={24} height={24} fill="#fff" />
      </View>
      <Text style={styles.title}>{title}</Text>
    </View>
  )
}
const styles = StyleSheet.create({
    Card: {
    width: 80,
    height: 80,
    backgroundColor: '#6C63FF',
    borderRadius: 20,
    justifyContent: 'flex-end',
    paddingBottom: 20,
    alignItems: 'center',
    
    },
  iconContainer: {
        width: 60,
        height: 60,
        backgroundColor: '#000',
        borderRadius: 100,
        justifyContent: 'center',
        position: 'absolute',
        top: -25,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#6C63FF'
    },
  title: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
})