import React, { Component, useState, useEffect } from 'react'
import { Platform, Image, StyleSheet, Text, View, TouchableOpacity, TextInput, Button } from 'react-native';
import * as ImagePicker from "expo-image-picker";
import axios from 'axios';
// import current from '../current'
import BottomTabNavigator from '../components/BottomTabNavigator';

export default function Profile( { navigation }) {
    const [data, setData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        last_login: ""
    });
    const [userPhoto, setUserPhoto] = useState("http://192.168.0.141:8080/default.jpg")

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
        setUserPhoto('http://192.168.0.141:8080/images/' + res.data.image)
    }

    // const pickImage = async () => {

    //   };

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
                setUserPhoto("http://192.168.0.141:8080/images/" + response.data)
                axios({
                    method: 'PUT',
                    url: 'http://192.168.0.141:8000/update/' + data._id,
                    data: {
                        image: response.data
                    },
                    headers: { 
                        "accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + localStorage.getItem('jwt')
                    }
                })
                .then((response) => {
                    console.log(response.data);
                })
            }, (error) => {
                console.log("error : "); 
                console.log(error); 
            })
        }
    }

    useEffect(() => {
        current();
    }, [])

    return (
        <View style={{width: '100%', height: '100%'}}>
        <View style={{padding: 16}}>
        <TouchableOpacity onPress={changeImage}>
        <Image source={{uri: userPhoto}} style={{width: 200, height: 200}}/>
        </TouchableOpacity>
        <Text>{data.first_name + ' ' + data.last_name}</Text>
        <Text>{data.email}</Text>
        <Text>Последний раз заходил(а) {data.last_login}</Text>
        <Button title="Изменить" onPress={() => {console.log(result)}}/>
        </View>
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