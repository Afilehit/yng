import axios from 'axios';

export async function Current() {
    if (localStorage.getItem('jwt')) {
        axios.get('http://127.0.0.1:8000/current', {
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('jwt')
            } 
        })
        .then((response) => {
            console.log(response.data);
            // localStorage.setItem('jwt', response.data.access_token)
            //navigation.navigate('Main')
            return response.data
        });
    } else {
        return null
    }
}