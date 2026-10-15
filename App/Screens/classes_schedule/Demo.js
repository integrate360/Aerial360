import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import HeaderComponent from '../Header/HeaderComponent';

const HorizontalCalendar = () => {
  const days = [
    { day: "Sun", date: 19 },
    { day: "Mon", date: 20 },
    {
      day: "Tue",
      date: 21,
      events: [
        { name: "Aerial Silks", time: "5:00 PM", color: "green" },
        { name: "Flying Pole", time: "7:15 PM", color: "red" },
      ],
    },
    {
      day: "Wed",
      date: 22,
      events: [
        { name: "Aerial Hoop", time: "4:00 PM", color: "blue" },
        { name: "Aerial Silks", time: "6:00 PM", color: "green" },
      ],
    },
    { day: "Thu", date: 23 },
    { day: "Fri", date: 24 },
    { day: "Sat", date: 25 },
  ];

  return (
    <>
      <HeaderComponent />
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "#0B1120",
          flex: 1,
        }}
      >
        <ScrollView
          horizontal
          style={{ flex: 1, paddingVertical: 10 }}
          showsHorizontalScrollIndicator={false}
        >
          {days.map((day, index) => (
            <View
              key={index}
              style={{
                width: 100,
                padding: 10,
                marginHorizontal: 5,
                backgroundColor: "#1E293B",
                borderRadius: 10,
              }}
            >
              <Text
                style={{
                  color: "#94A3B8",
                  fontSize: 14,
                  textAlign: "center",
                }}
              >
                {day.day}
              </Text>
              <Text
                style={{
                  color: "#E2E8F0",
                  fontSize: 20,
                  fontWeight: "bold",
                  textAlign: "center",
                  marginVertical: 5,
                }}
              >
                {day.date}
              </Text>
              {day.events &&
                day.events.map((event, idx) => (
                  <View
                    key={idx}
                    style={{
                      marginVertical: 5,
                      padding: 5,
                      borderRadius: 5,
                      backgroundColor: event.color,
                    }}
                  >
                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontSize: 12,
                      }}
                    >
                      {event.name}
                    </Text>
                    <Text
                      style={{
                        color: "#D1D5DB",
                        fontSize: 10,
                      }}
                    >
                      {event.time}
                    </Text>
                  </View>
                ))}
            </View>
          ))}
        </ScrollView>
      </View>
    </>
  );
};

export default HorizontalCalendar;
