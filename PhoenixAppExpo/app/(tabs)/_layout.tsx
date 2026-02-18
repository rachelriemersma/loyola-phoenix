import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { Image, View, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  const { isSearching, searchQuery, setIsSearching, setSearchQuery } = useCategory();

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerTintColor: '#8B0000',
        headerStyle: { backgroundColor: '#fff' },
        drawerStyle: { backgroundColor: '#fff' },
        headerTitle: isSearching
          ? () => (
              <TextInput
                autoFocus
                style={styles.searchInput}
                placeholder="Search articles..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                clearButtonMode="never"
              />
            )
          : () => <Image source={logo} style={styles.headerLogo} resizeMode="contain" />,
        headerTitleContainerStyle: isSearching ? styles.searchTitleContainer : undefined,
        headerRight: () => (
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              setIsSearching(!isSearching);
              if (isSearching) setSearchQuery('');
            }}
          >
            <Ionicons name={isSearching ? 'close' : 'search'} size={22} color="#8B0000" />
          </TouchableOpacity>
        ),
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
  headerButton: {
    paddingHorizontal: 14,
  },
  searchTitleContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
    color: '#111',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
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
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  drawerItemTextActive: {
    color: '#fff',
  },
});
