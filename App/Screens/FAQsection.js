import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from './Config/Config';
import { Appbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import fonts from './FontFamily/FontFamily';

const faqData = [
  {
    id: 1,
    category: 'General Information',
    items: [
      {
        id: '1-1',
        title: 'What is Airbound Academy?',
        description:
          "Airbound Academy is India's first dedicated Aerial and Pole Dance/Fitness Academy, offering professional training in aerial arts such as hoop, silks, slings, trapeze, flying pole, spiral, and rope.",
      },
      {
        id: '1-2',
        title: 'Where is Airbound Academy located?',
        description:
          'We have our flagship studio in [City/Location], and we occasionally host workshops in other cities.',
      },
      {
        id: '1-3',
        title: 'Who can join Airbound?',
        description:
          'We welcome all ages and fitness levels, from complete beginners to professional aerialists.',
      },
    ],
  },
  {
    id: 2,
    category: 'Classes & Training',
    items: [
      {
        id: '2-1',
        title: 'What types of classes do you offer?',
        description:
          'We offer:\n• Aerial Arts (Hoop, Silks, Slings, Rope, Trapeze, Flying Pole, Spiral)\n• Pole Dance & Fitness\n• Flexibility & Strength Training\n• Kids Aerial Classes\n• Special Workshops & Private Training',
      },
      {
        id: '2-2',
        title:
          "What's the difference between group classes and private sessions?",
        description:
          'Group Classes: Structured lessons with multiple students, following a progressive syllabus.\n\nPrivate Sessions: One-on-one training tailored to individual goals, ideal for faster progress or specific skill focus.',
      },
      {
        id: '2-3',
        title: 'How often should I train to see progress?',
        description:
          'Progress depends on your level:\n\nBeginner Level: 2-3 times per week\nIntermediate Level: 3-4 times per week\nAdvanced Level: 4-6 times per week\n\nMix classes with flexibility & strength training, and remember that recovery is just as important as training!',
      },
    ],
  },
  {
    id: 3,
    category: "Kids' Classes",
    items: [
      {
        id: '3-1',
        title: 'What age can kids start aerial arts?',
        description: 'We offer kids classes from ages 5 and up.',
      },
      {
        id: '3-2',
        title: 'Is aerial training safe for children?',
        description:
          'Absolutely! Our kids program follows progressive training methods with safety measures like mats and spotting.',
      },
    ],
  },
  {
    id: 4,
    category: 'Membership, Fees & Booking',
    items: [
      {
        id: '4-1',
        title: 'What are your membership options?',
        description:
          'We offer:\n• Group Class Packages (Monthly, Quarterly)\n• Private Training Packages\n• Drop-in Single Sessions\n• Workshops & Certifications',
      },
      {
        id: '4-2',
        title: 'Do you offer trial classes?',
        description:
          'Yes! You can book a trial class to experience the training before committing.',
      },
      {
        id: '4-3',
        title: 'How do I sign up for classes?',
        description:
          'You can register online through our website or visit our studio.',
      },
    ],
  },
  {
    id: 5,
    category: 'Safety & Equipment',
    items: [
      {
        id: '5-1',
        title: 'What should I wear to class?',
        description:
          'For Pole: Shorts & a fitted top (bare skin helps with grip)\nFor Aerial Arts: Full-length leggings and a fitted top to protect your skin\nNo lotions or jewelry (they can damage the equipment)',
      },
      {
        id: '5-2',
        title: 'Is aerial and pole fitness safe?',
        description:
          'Yes! Our instructors are certified professionals, and we prioritize safety, proper progressions, and injury prevention.',
      },
      {
        id: '5-3',
        title: 'Do you sell aerial/pole equipment?',
        description:
          'Yes, we collaborate with X-Pole India and other brands for high-quality poles and aerial apparatus.',
      },
    ],
  },
];

const AccordionList = () => {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedItem, setExpandedItem] = useState(null);
  const navigation = useNavigation();

  const toggleCategory = categoryId => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
    setExpandedItem(null);
  };

  const toggleItem = itemId => {
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };

  const renderFaqItem = ({ item }) => {
    const isExpanded = expandedItem === item.id;
    return (
      <View style={[styles.faqItem, isExpanded && styles.expandedItem]}>
        <TouchableOpacity
          onPress={() => toggleItem(item.id)}
          style={styles.faqHeader}>
          <Text style={styles.faqTitle}>{item.title}</Text>
          <Icon
            name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'}
            size={20}
            color="black"
          />
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.faqContent}>
            <Text style={styles.contentText}>{item.description}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderCategory = ({ item }) => {
    const isCategoryExpanded = expandedCategory === item.id;
    return (
      <View style={styles.categoryContainer}>
        <TouchableOpacity
          onPress={() => toggleCategory(item.id)}
          style={styles.categoryHeader}>
          <Text style={styles.categoryTitle}>{item.category}</Text>
          <Icon
            name={
              isCategoryExpanded ? 'chevron-up-outline' : 'chevron-down-outline'
            }
            size={24}
            color="black"
          />
        </TouchableOpacity>
        {isCategoryExpanded && (
          <FlatList
            data={item.items}
            renderItem={renderFaqItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.faqContainer}
          />
        )}
      </View>
    );
  };

  return (
    <LinearGradient
      style={styles.gradientBackground}
      colors={[Colors.primary, Colors.secondary]}
      start={{ x: 0.0, y: 0.2 }}
      end={{ x: 0.7, y: 1.0 }}>
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction
          size={30}
          color="#fff"
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerText}>FAQ's</Text>
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <FlatList
          data={faqData}
          renderItem={renderCategory}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          scrollEnabled={false}
        />
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  appBar: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  headerText: {
    color: '#FFF',
    fontWeight: '300',
    fontSize: 22,
    textAlign: 'center',
    fontFamily: fonts.regular,
  },
  listContainer: {
    padding: 16,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    color: 'black',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: fonts.regular,
  },
  faqContainer: {
    paddingHorizontal: 8,
  },
  faqItem: {
    marginBottom: 8,
  },
  faqHeader: {
    padding: 16,
    backgroundColor: '#fff',
    // marginLeft: 10,
    borderRadius: 12,
    elevation: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    // backgroundColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'rgb(250, 250, 250)',
    alignItems: 'center',
    elevation: 5,
  },
  faqTitle: {
    color: 'black',
    fontWeight: '400',
    fontSize: 14,
    fontFamily: fonts.regular,
    flex: 1,
    paddingRight: 8,
  },
  faqContent: {
    // backgroundColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'rgb(240, 240, 240)',
    marginHorizontal: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  contentText: {
    color: 'black',
    fontSize: 14,
    letterSpacing: 0.5,
    lineHeight: 20,
    fontFamily: fonts.regular,
  },
});

export default AccordionList;
