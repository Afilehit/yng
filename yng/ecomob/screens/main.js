import React, { Component, useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Button, Image } from 'react-native';
import { FlatList } from 'react-native-bidirectional-infinite-scroll';
import axios from 'axios';
import { Post } from '../components/post';
import BottomTabNavigator from '../components/BottomTabNavigator';

export default function Main( { navigation }) {
    const [data, setData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        last_login: ""
    });
    const [posts, setPosts] = useState({});
    const [nPost, setNPost] = useState(0);

    async function fetchPosts(n) {
        const res = await axios.get('http://192.168.0.141:8000/posts/' + n)
        setNPost(nPost+10)
        return res.data
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
        } else {
            navigation.navigate('SignIn')
        }
        console.log(res.data)
        for(let i = 0; i < res.data.length; i++) {
            
        }
        setData(res.data[0])
    }

    useEffect(() => {
        current();
        const initPosts = async () => {
            const initialPosts = await fetchPosts(nPost);
            setPosts(initialPosts)
        };
        initPosts();
    }, [])

    const loadMoreOlderPosts = async () => {
        const newPosts = await fetchPosts(nPost);
        setPosts((p) => {
          return p.concat(newPosts);
        });
    };

    // if (!posts) {
    //     return null;
    // }

    return (
        <View style={{width: '100%', height: '100%'}}>
            <FlatList
                data={posts}
                style={styles.list}
                onEndReached={loadMoreOlderPosts}
                renderItem={Post}
            />
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
    list: {
        width: '100%',
        marginBottom: 60
    },
    item: {
        aspectRatio: 1,
        width: '100%',
        width: 400, height: 400,
        flex: 1,
    },
  })