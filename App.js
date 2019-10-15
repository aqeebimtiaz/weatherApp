import React, {Component} from 'react';
import {
	View,
	Text,
	Image,
	StyleSheet,
	TextInput,
	TouchableHighlight,
	TouchableOpacity,
	PermissionsAndroid, Alert, Platform 
  } from 'react-native';
import { Card, Divider } from 'react-native-elements';
navigator.geolocation = require('@react-native-community/geolocation');
import { FlatList } from 'react-native';
import ForecastCard from './components/ForecastCard';

export async function request_device_location_runtime_permission() {
 
	try {
	  const granted = await PermissionsAndroid.request(
		PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
		{
		  'title': 'Weather App Location Permission',
		  'message': 'Weather App needs access to your location '
		}
	  )
	  if (granted === PermissionsAndroid.RESULTS.GRANTED) {
		console.log("Location Permission Granted.");
		// Alert.alert("Location Permission Granted.");
	  }
	  else {
   
		Alert.alert("Location Permission Not Granted");
   
	  }
	} catch (err) {
	  console.warn(err)
	}
  }

export default class App extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			cityname: '',
			time: '',
			icon: '',
			description: '',
			temperature: 0.00,
			forecast: [],
			latitude: '',
			longitude: '',
			error: false
		}
		this.handleChange = this.handleChange.bind(this);
    	this.handleSubmit = this.handleSubmit.bind(this);
	}
	handleChange(e) {
		this.setState({
		  username: e.nativeEvent.text
		});
	}
	handleSubmit() {
		this.getWeatherInfo(this.state.cityname);
	}
	
	async componentDidMount(){
		// Get the user's location
		// this.getLocation();
		// this.getWeatherInfo();
		if(Platform.OS === 'android')
		{
			await request_device_location_runtime_permission();
		}
		navigator.geolocation.getCurrentPosition(info => {
			// console.log(info);
			this.setState({
				latitude: info.coords.latitude,
				longitude: info.coords.longitude,
				error: null,
			});
			console.log('longtitude & latitude:');
			console.log(this.state.longitude);
			console.log( this.state.latitude);
			this.getWeather();
			(error) => this.setState({ error: error.message }),
			{ enableHighAccuracy: true, timeout: 2000, maximumAge: 100, distanceFilter: 10 }
		});
		
		// this.getLongLat = navigator.geolocation.watchPosition(
		// 	(position) => {
		// 	  this.setState({
		// 		latitude: position.coords.latitude,
		// 		longitude: position.coords.longitude,
		// 		error: null,
		// 	  });
		// 	},
		// 	(error) => this.setState({ error: error.message }),
		// 	{ enableHighAccuracy: true, timeout: 2000, maximumAge: 100, distanceFilter: 10 },
		// );
		
	}
	componentWillUnmount() {
		navigator.geolocation.clearWatch(this.getLongLat);
	}

	// getLocation(){
	// 	Geolocation.getCurrentPosition(info => console.log(info));
	// 	// Get the current position of the user
	// 	navigator.geolocation.getCurrentPosition(
	// 		(position) => {
	// 			this.setState(
	// 				(prevState) => ({
	// 				latitude: position.coords.latitude,
	// 				longitude: position.coords.longitude
	// 				}), () => { this.getWeather(); }
	// 			);
	// 		},
	// 		(error) => this.setState({ forecast: error.message }),
	// 		{ enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
	// 	);
	// }

	getWeatherInfo(){
		let url = 'https://api.openweathermap.org/data/2.5/weather?q=' + this.state.cityname + '&units=metric&appid=ce0cb4b99e8ee814c20a4f76609c8196'
		fetch(url)
		.then(response => response.json())
		.then(data => {
			console.log(data);
			// let tempData = JSON.stringify(data);
          	// console.log(tempData);
			// alert(tempData);
			let time;

			// Create a new date from the passed date time
			var date = new Date(data.dt*1000);

			// Hours part from the timestamp
			var hours = date.getHours();

			// Minutes part from the timestamp
			var minutes = "0" + date.getMinutes();

			time = hours + ':' + minutes.substr(-2);  
			this.setState({
				forecast: data,
				time: time,
				icon: data.weather[0].icon,
				description: data.weather[0].description,
				temperature: data.main.temp
			});
			// console.log("after set state:")
			// console.log(data.weather[0].icon)
		})
		.catch(function(error){
			console.log(error.message);
			throw error.message;
		  });
	}
	getWeather(){

		// Construct the API url to call
		let url = 'https://api.openweathermap.org/data/2.5/weather?lat=' + this.state.latitude + '&lon=' + this.state.longitude + '&units=metric&appid=ce0cb4b99e8ee814c20a4f76609c8196';
		// console.log(url);

		// Call the API, and set the state of the weather forecast
		fetch(url)
		.then(response => response.json())
		.then(data => {
			console.log(data);
			// let tempData = JSON.stringify(data);
				// console.log(tempData);
			// alert(tempData);
			let time;

			// Create a new date from the passed date time
			var date = new Date(data.dt*1000);

			// Hours part from the timestamp
			var hours = date.getHours();

			// Minutes part from the timestamp
			var minutes = "0" + date.getMinutes();

			time = hours + ':' + minutes.substr(-2);  
			this.setState({
				forecast: data,
				time: time,
				icon: data.weather[0].icon,
				description: data.weather[0].description,
				temperature: data.main.temp
			});
			// console.log("after set state:")
			// console.log(data.weather[0].icon)
		})
		.catch(function(error){
			console.log(error.message);
			throw error.message;
		  });
	}

	render() {
		let showErr = (
			this.state.error ?
			<Text>
				{this.state.error}
			</Text> :
			<View></View>
		);
		return (			
			<View style={styles.main}>

				<Text style={styles.title}>Search For City</Text>

				<TextInput style={styles.searchInput} value = {this.state.cityname} onChangeText = {(cityname) => this.setState({cityname})}/>
				
				<TouchableHighlight style = {styles.button} onPress = {this.handleSubmit} >
					<Text style={styles.buttonText}>SEARCH</Text>
				</TouchableHighlight>
				{showErr}
				<Card containerStyle={styles.card}>
					<Text style={styles.notes}>{this.state.forecast.name}</Text>

					<View style={{flexDirection:'row',  justifyContent:'space-between', alignItems:'center'}}>
						<Image style={{width:100, height:100}} source={{uri:"https://openweathermap.org/img/w/" + this.state.icon + ".png"}} />
						<Text style={styles.time}>{this.state.time}</Text>						
					</View>
					<Divider style={{ backgroundColor: '#dfe6e9', marginVertical:20}} />
					<View style={{flexDirection:'row', justifyContent:'space-between'}}>
						<Text style={styles.notes}>{this.state.description}</Text>
						<Text style={styles.notes}>{Math.round( this.state.temperature * 10) / 10 }&#8451;</Text>
					</View>
				</Card>
			</View>
			
			/*<FlatList data={this.state.forecast.list} style={{marginTop:20}} keyExtractor={item => item.dt_txt} renderItem={({item}) => <ForecastCard detail={item} location={this.state.forecast.city.name} />} />*/
		);
	}
}
const styles = StyleSheet.create({
	main: {
	  // flex: 1,
	  padding: 30,
	  marginTop: 65,
	  flexDirection: 'column',
	  justifyContent: 'center',
	  // backgroundColor: '#2a8ab7'
	},
	title: {
		marginTop:20,
		marginBottom: 20,
		fontSize: 25,
		textAlign: 'center'
	},
	searchInput: {
	  borderBottomWidth: 2,
	  height: 50,
	  padding: 4,
	  marginRight: 5,
	  fontSize: 23,
	  // borderWidth: 1,
	  borderColor: 'black',
	  borderRadius: 8,
	  color: 'black'
	},
	buttonText: {
	  fontSize: 18,
	  color: '#111',
	  alignSelf: 'center'
	},
	button: {
	  height: 45,
	  flexDirection: 'row',
	  backgroundColor:'lightblue',
	  borderColor: 'black',
	  borderWidth: 1,
	  borderRadius: 8,
	  marginBottom: 10,
	  marginTop: 10,
	  alignSelf: 'stretch',
	  justifyContent: 'center'
	},
	card:{
		backgroundColor:'rgba(56, 172, 236, 1)',
		borderWidth:0,
		borderRadius:20
	},
	time:{
		fontSize:38,
		color:'#fff'
	},
	notes: {
		fontSize: 18,
		color:'#fff',
		textTransform:'capitalize'
	}
});