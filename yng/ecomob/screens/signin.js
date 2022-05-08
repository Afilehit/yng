import React, { Component, useState, useEffect } from 'react'
import { Image, StyleSheet, Text, View, TouchableOpacity, TextInput, Button } from 'react-native';
import axios from 'axios';


export default function SignIn( { navigation }) {
    const [smsCame, setSmsCame] = useState(null);
    const [email, setEmail] = useState('lowthecure@gmail.com');
    const [password, setPassword] = useState('123456');
    const [data, setData] = useState(null);

    useEffect(() => {
        if (localStorage.getItem('jwt')) {
            navigation.navigate('Main')
        }
    }, []);


    async function signIn(){
        await axios({
            method: 'get',
            url: 'http://192.168.0.141:8000/getId/' + email,
        }).then(async (response) => {
            console.log(response.data._id);
            setData(response.data._id);
            console.log(data)
            var formData = new FormData();
            formData.append('username', response.data._id)
            formData.append('password', password)
            console.log(formData)
            axios({
                method: 'post',
                url: 'http://192.168.0.141:8000/token',
                data: formData
            })
            .then(async (response) => {
                console.log(123455667)
                console.log(response.data.access_token);
                localStorage.setItem('jwt', response.data.access_token)
                navigation.navigate('Main')
            });
        });
    }

    return (
        <View style={{width: '100%', height: '100%'}}>
        <Text style={styles.text}>Вход</Text>
        <TextInput
                style={styles.input}
                value={'lowthecure@gmail.com'}
                placeholder="Email"
                onChangeText={setEmail}
        />
        <TextInput
                style={styles.input}
                value={'123456'}
                placeholder="Пароль"
                onChangeText={setPassword}
        />
        <Button title="Отправить" onPress={signIn}/>
        </View>
    )
}

const styles = StyleSheet.create({
    text: {
    //   color: '#fff',
      fontSize: 30,
      fontFamily: 'Gilroy'
    },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 0.5,
        borderRadius: 30,
        padding: 10,
    },
  })