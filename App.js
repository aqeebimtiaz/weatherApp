import React, {Component} from 'react';
import {
	View,
	Text,
	Image,
	StyleSheet,
	TextInput,
	TouchableHighlight,
	TouchableOpacity,
	PermissionsAndroid, Alert, Platform,
	Dimensions 
  } from 'react-native';
import { Card, Divider } from 'react-native-elements';
navigator.geolocation = require('@react-native-community/geolocation');
import { FlatList } from 'react-native';
import ForecastCard from './components/ForecastCard';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LineChart } from "react-native-chart-kit";

const humidityIcon = <Icon name="water-percent" size={25} color="#fff" />;
const windIcon = <Icon name="weather-windy" size={25} color="#fff" />;
const cloudIcon = <Icon name="cloud" size={25} color="#fff" />;
const sunriseIcon = <Icon name="weather-sunset-up" size={25} color="#fff" />;
const sunsetIcon = <Icon name="weather-sunset-down" size={25} color="#fff" />;
const screenWidth = Dimensions.get("window").width;

var listChartData = {
	
};
const chartConfig = {
	backgroundGradientFrom: '#1E2923',
	backgroundGradientFromOpacity: 0,
	backgroundGradientTo: '#08130D',
	backgroundGradientToOpacity: 0.5,
	color: (opacity = 1) => `rgba(56, 172, 236, ${opacity})`,
	strokeWidth: 2, // optional, default 3
	barPercentage:0.5
  }

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
			name:'',
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
			listChartLabels:[],
			forecastTemp:[],
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
	
	componentDidMount(){
		// Get the user's location
		// this.getLocation();
		// this.getWeatherInfo();
		if(Platform.OS === 'android')
		{
			request_device_location_runtime_permission();
		}
		navigator.geolocation.getCurrentPosition(info => {
			// console.log(info);
			this.setState({
				loading: !this.state.loading,
				latitude: info.coords.latitude,
				longitude: info.coords.longitude,
				error: null,
			});
			console.log('longtitude & latitude:');
			console.log(this.state.longitude);
			console.log( this.state.latitude);
			this.getWeather();
			// this.getForecast();
			console.log('listChartData from componentDid')
			console.log(listChartData);
			(error) => this.setState({ error: error.message }),
			{ enableHighAccuracy: false, timeout: 40000, maximumAge: 20000, distanceFilter: 10 }
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
				name: data.name,
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
		// time = hours + period;
		return time;
	}

	// Get weather by city name
	getWeatherInfo(){
		let url = 'https://api.openweathermap.org/data/2.5/weather?q=' + this.state.cityname + '&units=metric&appid=ce0cb4b99e8ee814c20a4f76609c8196'
		fetch(url)
		.then(response => response.json())
		.then(data => {
			// console.log(data);
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
			// console.log(data);
			// let tempData = JSON.stringify(data);
				// console.log(tempData);
			// alert(tempData);
			this.processData(data);
		})
		.catch(function(error){
			console.log(error.message);
			throw error.message;
		  });

		this.getForecast();
		
		
	}

	processForecastData(returnData){
		// returnData = data;
		let date;
		let time = '';
		let period = '';
		let forecastTemp = [];
		let listChartLabels = [];
		returnData.list.forEach(element => {
			forecastTemp.push(parseFloat(element.main.temp));
			// date = new Date(element.dt_txt);
			// period = date.getHours() >= 12 ? ' PM' : ' AM';
			// time = date.getHours() + ':00' + period;
			time = this.convertTime(element.dt);
			// console.log(time);
			listChartLabels.push(time);
		});
		// console.log(forecastTemp);
		// console.log(listChartLabels);
		// console.log(returnData);
		// let forecastTemp = [];

		this.setState({
			listChartLabels: listChartLabels,
			forecastTemp: forecastTemp
		});
		// console.log(listChartData);
		// return listChartData;
		
	}

	// Get weather FORECAST by coordinates
	getForecast(){
		let returnData;
		let url = 'https://api.openweathermap.org/data/2.5/forecast?lat='+this.state.latitude+'&lon='+this.state.longitude+'&cnt=8&units=metric&appid=ce0cb4b99e8ee814c20a4f76609c8196';
		fetch(url)
		.then(response => response.json())
		.then(data => {
			// console.log(data);
			this.setState({
				forecast: data
			});

			this.processForecastData(data);
			// console.log(this.state.listChartLabels)
			listChartData = {
				labels:this.state.listChartLabels,
				datasets:[{
					data:this.state.forecastTemp
				}]}
			// console.log('listChartData from getForecast')
			// console.log(listChartData.datasets[0]);
			// console.log(this.state.forecastTemp)
			
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

		console.log("from render");
		// console.log(this.state.forecast.list);
		// let forecast = this.state.forecast.list;
		// console.log(forecast);
		let futureTemp = [];
		while(Object.keys(this.state.listChartLabels).length != Object.keys(futureTemp).length){
			this.state.forecastTemp.map(
				element => {
					futureTemp.push(element);
				}
			);
		}
		
		// console.log(futureTemp);
		let graph = <Text>Not initialized</Text>;
		if (Object.keys(this.state.listChartLabels).length == Object.keys(futureTemp).length){
			console.log("temp updated")
			console.log(futureTemp);
			// console.log(this.state.listChartLabels);
			const data = {
				labels: this.state.listChartLabels,
				datasets: [
					{
						// data: futureTemp
						data: [ 31.87, 30.81, 27.79, 26.94, 26.39, 25.75, 24.24, 23.37 ]
					}
				]
			};
			graph = 
				<LineChart
					data={data}
					width={screenWidth}
					height={120}
					verticalLabelRotation={30}
					chartConfig={chartConfig}
					bezier
				/>;
			
		}
		
		return (			
			<View style={styles.main}>

				<Text style={styles.title}>Search For City</Text>

				<TextInput style={styles.searchInput} value = {this.state.cityname} onChangeText = {(cityname) => this.setState({cityname})}/>
				
				<TouchableHighlight style = {styles.button} onPress = {this.handleSubmit} >
					<Text style={styles.buttonText}>SEARCH</Text>
				</TouchableHighlight>
				{showErr}
				<Card containerStyle={styles.card}>
					<Text style={styles.notes, styles.notesHeading}>{this.state.name}</Text>

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
				
				<View style={{marginRight:20}}>
					{graph}
				</View>
				
			</View>
			/*<FlatList data={this.state.forecast.list} style={{marginTop:20}} keyExtractor={item => item.dt_txt} renderItem={({item}) => <ForecastCard detail={item} location={this.state.forecast.city.name} />} />
			
			*/
			
		);
	}
}
const styles = StyleSheet.create({
	main: {
	  flex: 1,
	  padding: 10,
	  marginTop: 10,
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