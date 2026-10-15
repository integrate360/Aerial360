import React, {useEffect, useState} from 'react';
import {
  FlatList,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {Text} from 'react-native-paper';
import {Colors} from '../Config/Config';
import fonts from '../FontFamily/FontFamily';
import CategoryItem from './CategoryItem';
import {getAllCategerys} from '../Api/Allapi';
import HeaderComponent from '../Header/HeaderComponent';

const AllCategoryForBottomNav = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    setLoading(true);
    const fetchCategories = async () => {
      try {
        const res = await getAllCategerys();
        if (res?.status == 200) {
          setCategories(res?.data);
        } else {
          setCategories([]);
          console.error('Error fetching categories:', res?.message);
        }
      } catch (err) {
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <>
      <HeaderComponent />
      <ScrollView
        style={{}}
        contentContainerStyle={{}}
        showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} />
        ) : categories.length === 0 ? (
          <Text style={styles.noDataText}>
            No classes found for this category.
          </Text>
        ) : (
          <FlatList
            data={categories}
            renderItem={item => (
              <CategoryItem item={item.item} isStatic={false} />
            )}
            scrollEnabled={false}
          />
        )}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 13,
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 3,
    margin: 15,
    marginHorizontal: 8,
    top: 5,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    bottom: 10,
  },
  title: {
    fontSize: 18,
    // fontWeight: 'bold',
    color: '#333',
    fontFamily: fonts.regular,
  },
  description: {
    fontSize: 15,
    color: '#666',
    marginTop: 4,
    fontFamily: fonts.regular,
  },
  buttonContainer: {
    marginLeft: 12,
  },
  demoText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
  noDataText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default AllCategoryForBottomNav;
