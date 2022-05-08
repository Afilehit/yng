import React, { Component, useState, useEffect } from 'react'
import { Platform, Image, StyleSheet, Text, View, TouchableOpacity, TextInput, Button } from 'react-native';
import * as ImagePicker from "expo-image-picker";
import axios from 'axios';
import BottomTabNavigator from '../components/BottomTabNavigator';

export default function AddPost( { navigation }) {
    const [header, setHeader] = useState('');
    const [text, setText] = useState('');
    const [PhotoUrl, setPhotoUrl] = useState("http://192.168.0.141:8080/default.jpg");
    // const [password, setPassword] = useState(null);
    const [data, setData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        role: ""
    });

    const current = async () => {
        var res = ''
        if (localStorage.getItem('jwt')) {
            res = await axios.get('http://192.168.0.141:8000/current', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('jwt')
                } 
            })
        } else {
            navigation.navigate('SignIn')
        }
        console.log(res.data)
        setData(res.data)
        //setUserPhoto('http://192.168.0.141:8080/images/' + res.data.image)
    }

    const changeImage = async () =>{
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 1,
          });
      
          // console.log(result.uri);
      
        if (result.cancelled) {
            console.log(result);
        } else {
            console.log(result, Platform.OS)
            let img_to_upload = {  
                type: 'image/jpeg',
                name: 'img.jpg',
                uri: Platform.OS === 'android' ? result.uri : result.uri.replace('file://', ''),
            };  
        
            let formData = new FormData();
            formData.append("title", 'this is tandom text');
            formData.append("file", img_to_upload);

            axios({
                method: 'POST',
                url: 'http://192.168.0.141:8000/uploadFile',  
                data: formData,
                headers: { 
                    "Content-Type": "multipart/form-data",
                }
            })
            .then((response) => {
                console.log("response : ");  
                console.log(response.data);
                setPhotoUrl("http://192.168.0.141:8080/images/" + response.data)
            })
        }
    }

    useEffect(() => {
        current()
    }, []);


    async function addPost(){
        console.log(data.email)
        console.log(header, text, PhotoUrl)
        await axios({
                method: 'post',
                url: 'http://192.168.0.141:8000/addPost',
                data: {
                    header: header,
                    text: text,
                    photoUrl: PhotoUrl,
                    avatar: data.image,
                    first_name: data.first_name,
                    last_name: data.last_name,
                    email: data.email,
                    role: data.role,
                    created_at: ''
                }
            })
            .then(async (response) => {
                console.log(response)
                navigation.navigate('Main')
            });
    }

    return (
        <View style={{width: '100%', height: '100%'}}>
        <Text>{data.email}</Text>
        <TouchableOpacity onPress={changeImage}>
        <Image source={{uri: PhotoUrl}} style={{width: 400, height: 400}}/>
        </TouchableOpacity>
        <TextInput
                style={styles.input}
                placeholder="Заголовок"
                onChangeText={setHeader}
        />
        <TextInput
                style={styles.input}
                placeholder="Описание"
                onChangeText={setText}
        />
        <Button title="Отправить" onPress={addPost}/>
        <BottomTabNavigator background="#FFF" colorIcon="#868686" profileColorIcon="#2B7AF3" navigation={navigation}/>
        </View>
    )
}

const styles = StyleSheet.create({
    text: {
      color: '#fff',
      fontSize: 30,
      fontWeight: 'bold'
    },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 0.5,
        borderRadius: 30,
        padding: 10,
    },
  })