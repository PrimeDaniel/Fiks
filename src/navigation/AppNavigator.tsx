import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import CreateJobScreen from '../screens/CreateJobScreen';
import LoginScreen from '../screens/LoginScreen';

export type RootStackParamList = {
    Home: undefined;
    CreateJob: undefined;
    Login: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
    return (
        <Stack.Navigator initialRouteName="Home">
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Home Repair Marketplace' }} />
            <Stack.Screen name="CreateJob" component={CreateJobScreen} options={{ title: 'Post a Job' }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Authentication' }} />
        </Stack.Navigator>
    );
};

export default AppNavigator;
