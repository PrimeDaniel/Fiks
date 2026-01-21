import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import CreateJobScreen from '../screens/CreateJobScreen';
import LoginScreen from '../screens/LoginScreen';
import JobDetailScreen from '../screens/JobDetailScreen';
import MyJobsScreen from '../screens/MyJobsScreen';
import ProProfileScreen from '../screens/ProProfileScreen';
import { Job } from '../types/database';
import { COLORS, FONTS } from '../theme';

export type RootStackParamList = {
    Home: undefined;
    CreateJob: undefined;
    Login: undefined;
    JobDetail: { job: Job };
    MyJobs: undefined;
    ProProfile: { proId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
                headerStyle: {
                    backgroundColor: COLORS.white,
                },
                headerTintColor: COLORS.text,
                headerTitleStyle: {
                    fontFamily: FONTS.heading.bold,
                    fontSize: 18,
                    color: COLORS.text,
                },
                headerShadowVisible: false,
                contentStyle: {
                    backgroundColor: COLORS.background,
                },
            }}
        >
            <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="CreateJob"
                component={CreateJobScreen}
                options={{
                    title: 'Post a Job',
                    headerBackTitle: 'Back',
                }}
            />
            <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{
                    title: 'Sign In',
                    headerBackTitle: 'Back',
                }}
            />
            <Stack.Screen
                name="JobDetail"
                component={JobDetailScreen}
                options={{
                    title: 'Job Details',
                    headerBackTitle: 'Back',
                }}
            />
            <Stack.Screen
                name="MyJobs"
                component={MyJobsScreen}
                options={{
                    title: 'My Jobs',
                    headerBackTitle: 'Back',
                }}
            />
            <Stack.Screen
                name="ProProfile"
                component={ProProfileScreen}
                options={{
                    title: 'Pro Profile',
                    headerBackTitle: 'Back',
                }}
            />
        </Stack.Navigator>
    );
};

export default AppNavigator;
