/**
 * Medicine Alarm App
 * @format
 */

import React from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {ThemeProvider, useTheme} from './src/context/ThemeContext';
import MedicineListScreen from './src/screens/MedicineListScreen';
import AddMedicineScreen from './src/screens/AddMedicineScreen';
import {StatisticsScreen} from './src/screens/StatisticsScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const {colors, isDark} = useTheme();

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.gradientStart}
      />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="MedicineList"
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.primary,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}>
          <Stack.Screen
            name="MedicineList"
            component={MedicineListScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="AddMedicine"
            component={AddMedicineScreen}
            options={({route}) => ({
              title: route.params?.medicine ? '약 수정' : '약 추가',
              headerStyle: {
                backgroundColor: colors.primary,
              },
            })}
          />
          <Stack.Screen
            name="Statistics"
            component={StatisticsScreen}
            options={{
              title: '복용 통계',
              headerStyle: {
                backgroundColor: colors.primary,
              },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
