/**
 * Sample React Native Chat
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
 import React, { useState, useRef, useCallback, useEffect } from 'react';
 import {
   SafeAreaView,
   ScrollView,
   StatusBar,
   StyleSheet,
   Text,
   useColorScheme,
   View,
   FlatList,
   Image,
   TouchableOpacity
 } from 'react-native';
 import { useNavigation, useRoute } from '@react-navigation/native';
 import { GiftedChat } from 'react-native-gifted-chat'
 
 const Chat = () => {
   const navigation = useNavigation()
   const route = useRoute();
   const [messages, setMessages] = useState([]);
   const [senderId, setSenderId] = useState('')
   const [receiverId, setReceiverId] = useState('62734c68cac379abfb51ba3e')
   const [name, setName] = useState()
   const [image_path, setImage_path] = useState()
   const ws = useRef(null);

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
    setSenderId(res.data._id)
    setImage_path(res.data.image)
    console.log(res.data)
    setData(res.data)
  }
 
   useEffect(() => {
     console.log("initiateSocketConnection")
     // enter your websocket url
     ws.current = new WebSocket(`wss://192.168.0.141:8081`)
     ws.current.onopen = () => {
       console.log("connection establish open")
     };
     ws.current.onclose = () => {
       console.log("connection establish closed");
     }
     return () => {
       ws.current.close();
     };
   }, [])
 
   useEffect(() => {
     current()
     setMessages([
       {
         _id: receiverId,// receiver id
         text: 'Hello',
         createdAt: new Date(),
         user: {
           _id: senderId,  // sender id
           name: name,
           avatar: image_path,
         },
       },
     ])
   }, [])
 
   useEffect(() => {
    setReceiverId()
     ws.current.onmessage = e => {
       const response = JSON.parse(e.data);
       console.log("onmessage=>", JSON.stringify(response));
       var sentMessages = {
         _id: response.receiverId,
         text: response.message,
         createdAt: new Date(response.createdAt * 1000),
         user: {
           _id: response.senderId,
           name: name,
           avatar: image_path,
         },
       }
       setMessages(previousMessages => GiftedChat.append(previousMessages, sentMessages))
     };
   }, []);
 
   const onSend = useCallback((messages = []) => {
     let obj = {
       "senderId": senderId,
       "receiverId": receiverId,
       "message": messages[0].text,
       "action": "message"
     }
     ws.current.send(JSON.stringify(obj))
     setMessages(previousMessages => GiftedChat.append(previousMessages, messages))
   }, [])
 
   return (
     <View style={styles.container}>
       <View style={{
         padding: 15,
         marginTop: 50,
         backgroundColor: "black",
         alignItems: "center",
         justifyContent: 'center',
         width: '100%'
       }}>
         <TouchableOpacity
           style={{
             position: 'absolute',
             left: 10,
             borderColor: "#fff",
             borderWidth: 1,
             padding: 7,
             borderRadius: 10
           }}
           onPress={() => {
             navigation.goBack()
           }}
         >
           <Text
             style={{
               fontSize: 15,
               fontWeight: 'bold',
               color: "#fff",
             }}
           >{`Back`}</Text>
         </TouchableOpacity>
         <Text style={{
           fontSize: 20,
           fontWeight: 'bold',
           color: "#fff"
         }}>{`Chat list`}</Text>
       </View>
       <GiftedChat
         messages={messages}
         onSend={messages => onSend(messages)}
         user={{
           _id: senderId,  // set sender id
         }}
       />
     </View>
   );
 };
 
 const styles = StyleSheet.create({
   container: {
     flex: 1,
     backgroundColor: "#fff"
   }
 });
 export default Chat;
 