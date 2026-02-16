import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';

import { CategoryProvider, CATEGORIES, useCategory } from '@/contexts/category-context';

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { selectedName, setCategory } = useCategory();

  return (
    <DrawerContentScrollView {...props}>
      <Text style={styles.drawerTitle}>The Loyola Phoenix</Text>
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
        headerTitle: 'The Loyola Phoenix',
        headerTitleStyle: {
          color: '#8B0000',
          fontWeight: 'bold',
          fontSize: 20,
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
  drawerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#8B0000',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#8B0000',
    marginBottom: 8,
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
    color: '#333',
  },
  drawerItemTextActive: {
    color: '#fff',
  },
});
