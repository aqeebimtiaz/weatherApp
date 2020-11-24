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
import RNLocation from 'react-native-location';
import { FlatList } from 'react-native';
import ForecastCard from './components/ForecastCard';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const humidityIcon = <Icon name="water-percent" size={25} color="#fff" />;
const windIcon = <Icon name="weather-windy" size={25} color="#fff" />;
const cloudIcon = <Icon name="cloud" size={25} color="#fff" />;
const sunriseIcon = <Icon name="weather-sunset-up" size={25} color="#fff" />;
const sunsetIcon = <Icon name="weather-sunset-down" size={25} color="#fff" />;

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
			humidity: '',
			windSpeed: '',
			cloudPercentage: '',
			loading: false,
			error: false,
			locationAccessPermission: false,
			locationData: {},
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
	
	componentDidMount = async () => {
		// Get the user's location
		// this.getLocation();
		// this.getWeatherInfo();
		RNLocation.configure({
			distanceFilter: 5.0
		})
			
		await RNLocation.requestPermission({
			ios: "whenInUse",
			android: {
				detail: "fine",
				rationale: {
					title: "We need to access your location",
					message: "We use your location to show where you are on the map",
					buttonPositive: "OK",
					buttonNegative: "Cancel"
				}
			}
		}).then(granted => {
			this.setState({
				locationAccessPermission: granted
			});
		});

		if (this.state.locationAccessPermission) {
			await RNLocation.getLatestLocation({ timeout: 60000 })
				.then(latestLocation => {
					console.log(latestLocation)
					// this.setState({
					// 	locationData: latestLocation
					// })
					this.setState({
						loading: !this.state.loading,
						latitude: latestLocation.latitude,
						longitude: latestLocation.longitude,
						error: null,
					});
					// Use the location here
				});
			this.getWeather();
		}
	}

	processData(data){
		if (data.cod == 404){
			let message = data.message.replace(/^\w/, c => c.toUpperCase());
			Alert.alert(message);
		}
		else if (data.cod == 200){
			var time = this.convertTime(data.dt);
			var sunrise = this.convertTime(data.sys.sunrise);
			var sunset = this.convertTime(data.sys.sunset);
			this.setState({
				forecast: data,
				time: time,
				icon: data.weather[0].icon,
				description: data.weather[0].description,
				temperature: data.main.temp,
				humidity: data.main.humidity,
				windSpeed: data.wind.speed,
				cloudPercentage: data.clouds.all,
				sunrise: sunrise,
				sunset: sunset
			});
			// console.log("after set state:")
			// console.log(data.weather[0].icon)
		}
	}

	convertTime(timeStamp){
		let time;

		// Create a new date from the passed date time
		var date = new Date(timeStamp*1000);

		// Hours part from the timestamp
		var hours = date.getHours() - (date.getHours() >= 12 ? 12 : 0);

		// Minutes part from the timestamp
		var minutes = "0" + date.getMinutes();
		var period = date.getHours() >= 12 ? ' PM' : ' AM';

		time = hours + ':' + minutes.substr(-2) + period;
		return time;
	}

	// Get weather by city name
	getWeatherInfo(){
		let url = 'https://api.openweathermap.org/data/2.5/weather?q=' + this.state.cityname + '&units=metric&appid=ce0cb4b99e8ee814c20a4f76609c8196'
		fetch(url)
		.then(response => response.json())
		.then(data => {
			console.log(data);
			// let tempData = JSON.stringify(data);
          	// console.log(tempData);
			// alert(tempData);
			this.processData(data);			
		})
		.catch(function(error){
			console.log(error.message);
			throw error.message;
		});

		// this.getForecast();
	}
	
	// Get weather by coordinates
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
			this.processData(data);
		})
		.catch(function(error){
			console.log(error.message);
			throw error.message;
		  });

		// this.getForecast();
	}

	// Get weather FORECAST by coordinates
	getForecast(){
		let url = 'https://api.openweathermap.org/data/2.5/forecast?lat='+this.state.latitude+'&lon='+this.state.longitude+'&appid=ce0cb4b99e8ee814c20a4f76609c8196';
		fetch(url)
		.then(response => response.json())
		.then(data => {
			console.log(data);
			// let tempData = JSON.stringify(data);
          	// console.log(tempData);
			// alert(tempData);
			this.setState({
				forecast: data
			})		
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

						<View style={{flexDirection:'column', justifyContent:'space-between', alignItems:'center'}}>
							<Image style={{width:100, height:100}} source={{uri:"https://openweathermap.org/img/w/" + this.state.icon + ".png"}} />
							<Text style={styles.notes}>{this.state.description}</Text>
						</View>
						

						<View style={{flexDirection:'column', justifyContent:'space-between', alignItems:'center'}}>
							<Text style={styles.time}>{Math.round( this.state.temperature * 10) / 10 }&#8451;</Text>
							<Text style={styles.notes}>{cloudIcon} {this.state.cloudPercentage}% </Text>

							<View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
								<Text style={styles.notes}>{humidityIcon} {this.state.humidity}% </Text>
								<Text style={styles.notesNotCapital}>{windIcon} {this.state.windSpeed}m/s</Text>
							</View>

						</View>
					</View>

					<Divider style={{ backgroundColor: '#dfe6e9', marginVertical:20}} />

					<View style={{flexDirection:'row', justifyContent:'space-between'}}>
						<Text style={styles.notesNotCapital}>{sunriseIcon} {this.state.sunrise}</Text>
						<Text style={styles.notesNotCapital}>{sunsetIcon} {this.state.sunset}</Text>
					</View>

				</Card>

				<FlatList data={this.state.forecast.list} style={{marginTop:20}} keyExtractor={item => item.dt_txt} renderItem={({item}) => <ForecastCard detail={item} location={this.state.forecast.city.name} />} />

			</View>
			
			
		);
	}
}
const styles = StyleSheet.create({
	main: {
	  flex: 1,
	  padding: 10,
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
		textTransform:'capitalize',
	},
	notesNotCapital: {
		fontSize: 18,
		color:'#fff'
	}
});