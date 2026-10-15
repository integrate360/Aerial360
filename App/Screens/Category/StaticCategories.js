import React from 'react';
import {View, FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import {Colors} from '../Config/Config';
import fonts from '../FontFamily/FontFamily';
import CategoryItem from './CategoryItem';
import {StaticCategoryData} from './staticCategoryData';
import StaticCategoryItem from './StaticCategoryItem';

const StaticCategory = () => {
  return (
    <View style={{padding: 10}}>
      <FlatList
        data={StaticCategoryData}
        keyExtractor={item => item._id}
        renderItem={item => (
          <StaticCategoryItem item={item.item} isStatic={true} />
        )}
        scrollEnabled={false}
      />
    </View>
  );
};

export default StaticCategory;
