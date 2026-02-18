import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { Image, View, TouchableOpacity, StyleSheet } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import { Text } from 'react-native';

import { CategoryProvider, CATEGORIES, useCategory } from '@/contexts/category-context';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const logo = require('@/assets/images/tlp-black.png');

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { selectedName, setCategory } = useCategory();

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerLogoContainer}>
        <Image source={logo} style={styles.drawerLogo} resizeMode="contain" />
      </View>
      {CATEGORIES.map(category => (
        <TouchableOpacity
          key={category.name}
          style={[
            styles.drawerItem,
            selectedName === category.name && styles.drawerItemActive,
          ]}
          onPress={() => {
            setCategory(category.id, category.name);
            props.navigation.closeDrawer();
          }}
        >
          <Text
            style={[
              styles.drawerItemText,
              selectedName === category.name && styles.drawerItemTextActive,
            ]}
          >
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </DrawerContentScrollView>
  );
}

function DrawerNavigator() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerTintColor: '#8B0000',
        headerTitle: () => (
          <Image source={logo} style={styles.headerLogo} resizeMode="contain" />
        ),
        drawerStyle: {
          backgroundColor: '#fff',
        },
        headerStyle: {
          backgroundColor: '#fff',
        },
      }}
    >
      <Drawer.Screen name="index" />
      <Drawer.Screen name="explore" options={{ drawerItemStyle: { display: 'none' } }} />
    </Drawer>
  );
}

export default function DrawerLayout() {
  return (
    <CategoryProvider>
      <DrawerNavigator />
    </CategoryProvider>
  );
}

const styles = StyleSheet.create({
  headerLogo: {
    width: 200,
    height: 44,
  },
  drawerLogoContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#8B0000',
    marginBottom: 8,
    alignItems: 'center',
  },
  drawerLogo: {
    width: 180,
    height: 40,
  },
  drawerItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  drawerItemActive: {
    backgroundColor: '#8B0000',
  },
  drawerItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  drawerItemTextActive: {
    color: '#fff',
  },
});
