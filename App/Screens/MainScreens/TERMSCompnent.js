import React from 'react';
import { ScrollView, Text, View, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../Config/Config';
import { Appbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import fonts from '../FontFamily/FontFamily';
// JSON data for terms and conditions
const termsData = {
  terms: [
    {
      id: 1,
      title: 'Payment Policy',
      description:
        'We request payment in advance on a monthly basis. No refunds are given for days when the student is not in attendance. In exceptional circumstances an agreement may be reached to pay in arrears; however, you will still be committing to pay for the full amount. Late Payment: Should fees not be settled within two weeks of the starting date, the student will be asked to cease to attend.',
    },
    {
      id: 2,
      title: 'Cancellation Policy',
      description:
        'Notice of four weeks must be given in writing if a student wishes to cease attending lessons. Fees will still be due even if the student is unable to attend class until the completion of the notice period. Fees will not be refunded if a student decides to leave during the course. Should a student leave for medical purposes (a Doctor’s letter will be required in these circumstances) membership may be paused.',
    },
    {
      id: 3,
      title: 'Attendance Policy',
      description:
        'It is a fundamental necessity for the teacher/choreographer to have the time to work with the students. Notify absences 24 hours in advance; otherwise, it will be counted as a missed session.',
    },
    {
      id: 4,
      title: 'Lateness Policy',
      description:
        'Students are expected to arrive on time. Dance is a physical activity that requires the body to be warmed up in order to execute movement safely. Late students miss the proper warm-up and therefore may sustain an injury. Students who arrive more than 10 minutes late may be asked to observe the class for reasons of health and safety.',
    },
    {
      id: 5,
      title: 'Dress Code & Lost Property Policy',
      description:
        'Students must present themselves in a tidy manner at all times. Correct attires must always be worn. Students that are not dressed appropriately will not be allowed to take a class. If you have any questions regarding the dress code for a particular lesson, please ask the teacher or email contact@aerial360.in. Aerial360 does not accept responsibility for items lost or stolen, although anything we do find will be placed in lost property.',
    },
    {
      id: 6,
      title: 'Behavior Policy',
      description:
        'During sessions, students are expected to behave in a polite manner. They are expected to listen and we discourage unnecessary talking. If a student is causing disruption to others’ learning they may be asked to leave the lesson. Any unacceptable behavior from students and/or parents/carers will not be tolerated.',
    },
    {
      id: 7,
      title: 'Anti-Bullying Policy',
      description:
        'Aerial360 recognizes that every student has the right to enjoy a life free from bullying; therefore, we will always take seriously all allegations of bullying and are committed to deal with it effectively when it does happen.',
    },
    {
      id: 8,
      title: 'Health and Safety',
      description:
        'Aerial360 takes seriously their responsibility to ensure the health and safety of all participants, teachers, and volunteers; and takes appropriate measures to make sure the environment is safe for all. Dance is an active engagement as any sport, and whilst every effort is made to avoid them, injuries can happen. The school accepts no responsibility for injuries sustained via any means other than a teacher’s negligence.',
    },
    {
      id: 9,
      title: 'Appropriate Physical Contact Policy',
      description:
        'Teaching dance is a physical activity and appropriate physical contact between students and teachers in class is essential to training. Aerial360 recognizes that such physical contact is a potentially complex area, and the company also fully recognizes its responsibilities for safeguarding students and teachers and for protecting their welfare.',
    },
    {
      id: 10,
      title: 'Media Use Rights Permission',
      description:
        'We ask parents/guardians to grant permission for Aerial360 to take photographs and videos of the students. No personal information is ever used or linked to the photographs. We ask for full rights to use the images resulting from the photography/video filming, and any reproductions or adaptations of the images for fundraising, publicity or other purposes.',
    },
    {
      id: 11,
      title: 'Safeguarding',
      description:
        'Our prime responsibility is the welfare and well-being of all students in our care. As such we believe that we have a duty to the students, parents/main carers, and staff to act quickly and responsibly in any instance that may come to our attention.',
    },
  ],
};

const TERMSComponent = () => {
  const navigation = useNavigation();

  return (
    <><LinearGradient
      style={{

      }}
      colors={[Colors.primary, Colors.secondary]}
      start={{ x: 0.1, y: 0.0 }}
      end={{ x: 0.4, y: 0.6 }}>
      <Appbar.Header style={{ backgroundColor: 'transparent' }}>
        <Appbar.BackAction
          size={30}
          color="#fff"
          onPress={() => navigation.goBack()} />
        <Text
          style={{
            color: '#FFF',
            fontWeight: '300',
            fontSize: 22,
            fontFamily: fonts.regular
          }}>
          TERMS & CONDITIONS
        </Text>

      </Appbar.Header>

    </LinearGradient>






      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View
          style={{
            flex: 1,
            borderTopLeftRadius: 300,
            backgroundColor: '#fff',
            borderTopRightRadius: 300,
            width: '140%',
            alignSelf: 'center',
          }}>
          <View
            style={{
              flex: 1,
              padding: 20,
              alignSelf: 'center',
              bottom: 60,
            }}>
            <View
              style={{
                width: '80%',
                backgroundColor: 'white',
                borderRadius: 10,
                padding: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
              }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  marginBottom: 20,
                  textAlign: 'center',
                }}>
                Terms & Conditions
              </Text>

              {termsData?.terms?.map(term => (
                <View key={term?.id} style={{ marginBottom: 20 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      marginBottom: 5,
                      color: '#777', fontFamily: fonts.regular
                    }}>
                    {term?.id}. {term?.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: '#555',
                      fontFamily: fonts.regular
                    }}>
                    {term?.description}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView></>

  );
};

export default TERMSComponent;
