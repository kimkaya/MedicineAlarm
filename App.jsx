/**
 * Medicine Alarm App
 * @format
 * 
 * 오류 수정할려고 클로드까지 깔았는데 jdk버전문제였음 fuck
 * 
 * */

import React from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import MedicineListScreen from './src/screens/MedicineListScreen';
import AddMedicineScreen from './src/screens/AddMedicineScreen';

const Stack = createNativeStackNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="MedicineList"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#2196F3',
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
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
