import React, { Component, useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Button, Image, FlatList } from 'react-native';
// import { FlatList } from 'react-native-bidirectional-infinite-scroll';
import axios from 'axios';
import BottomTabNavigator from '../components/BottomTabNavigator';
import { Comment } from '../components/comment';

export default function Comments( { navigation, route }) {
    const [data, setData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        last_login: ""
    });
    const [posts, setPosts] = useState({});
    const [text, setText] = useState('');

    async function fetchPosts() {
        const res = await axios.get('http://192.168.0.141:8000/comments/' + route.params.postId)
        console.log(res)
        return res.data
    }
    async function addComment() {
        const user = await current()
        console.log(user)
        if(user == false){
            navigation.navigate('SignIn')
        } else {
            const res = await axios(
                {
                    url: 'http://192.168.0.141:8000/addComment/',
                    method: 'post',
                    data: {
                        postId: route.params.postId,
                        image: user.image,
                        text: text,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        created_at: ''
                    }
                }
            )
            console.log(res.data)
            var newArray = [...posts , {postId: route.params.postId, image: user.image, text: text, first_name: user.first_name,last_name: user.last_name,created_at: ''}];
            setPosts(newArray);
        }
    }

    const current = async () => {
        var res = ''
        if (localStorage.getItem('jwt')) {
            res = await axios.get('http://192.168.0.141:8000/current', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('jwt')
                } 
            })
            return res.data
        } else {
            return false
        }
    }

    useEffect(() => {
        current();
        console.log(route.params.postId)
        const initPosts = async () => {
            const initialPosts = await fetchPosts();
            setPosts(initialPosts)
        };
        initPosts();
    }, [])

    // if (!posts) {
    //     return null;
    // }

    return (
        <View style={{width: '100%', height: '100%'}}>
            <FlatList
                data={posts}
                style={styles.list}
                renderItem={Comment}
            />
            <View style={styles.addcom}>
                <TextInput
                    style={styles.input}
                    placeholder="Введите комментарий"
                    onChangeText={setText}
                />
                <Button title="Send" onPress={addComment}/>
            </View>
            <BottomTabNavigator background="#FFF" colorIcon="#868686" homeColorIcon="#2B7AF3" navigation={navigation}/>
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
    addcom: {
        position: 'absolute',
        display: 'flex',
        flexDirection: 'row',
        wdith: '100%',
        height: 60,
        bottom: 60
    },
    list: {
        width: '100%',
    },
    item: {
        aspectRatio: 1,
        width: '100%',
        width: 400, height: 400,
        flex: 1,
    },
  })