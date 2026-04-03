import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const dashboard = () => {
  return (
    <View style={styles.head}>
      <Text>Welcome Back</Text>
            <Text>Souheil Guellil</Text>

    </View>
  )
}

export default dashboard

const styles = StyleSheet.create({
    head:{
        backgroundColor:'blue',
    }
})