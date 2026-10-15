import React from 'react';
import {Text, StyleSheet} from 'react-native';

export const Texts = ({style, children, ...props}) => {
  return (
    <Text
      style={{
        fontFamily: 'Futura Bk',
        ...style,
      }}
      {...props}>
      {children}
    </Text>
  );
};
export const HeaderText = ({style, children, ...props}) => {
  return (
    <Text
      style={{
        fontFamily: 'Futura Bk',
        fontSize: 30,
        fontWeight: 'bold',
        color: 'black',
        ...style,
      }}
      {...props}>
      {children}
    </Text>
  );
};

export const SubHeaderText = ({style, children, ...props}) => {
  return (
    <Text
      style={{
        fontFamily: 'Futura Bk',
        fontSize: 22,
        color: 'black',
        fontWeight: '600',
        ...style,
      }}
      {...props}>
      {children}
    </Text>
  );
};

export const BodyText = ({style, children, ...props}) => {
  return (
    <Text
      style={{
        fontFamily: 'poppins',
        color: 'black',
        lineHeight: 20,
        fontSize: 16,
        ...style,
      }}
      {...props}>
      {children}
    </Text>
  );
};

export const DangerText = ({style, children, ...props}) => {
  return (
    <Text
      style={{
        fontFamily: 'Futura Bk',
        fontSize: 18,
        fontWeight: '700',
        color: 'orangered',
        ...style,
      }}
      {...props}>
      {children}
    </Text>
  );
};

export const SuccessText = ({style, children, ...props}) => {
  return (
    <Text
      style={{
        fontFamily: 'Futura Bk',
        fontSize: 18,
        fontWeight: '700',
        color: 'green',
        ...style,
      }}
      {...props}>
      {children}
    </Text>
  );
};

export const ImportantText = ({style, children, ...props}) => {
  return (
    <Text
      style={{
        fontFamily: 'Futura Bk',
        fontSize: 20,
        fontWeight: 'bold',
        color: 'red',
        textTransform: 'uppercase',
        ...style,
      }}
      {...props}>
      {children}
    </Text>
  );
};
export const FaddedText = ({style, children, ...props}) => {
  return (
    <Text
      style={{
        fontFamily: 'poppins',
        color: 'black',
        opacity: 0.5,
        lineHeight: 20,
        fontSize: 16,
        ...style,
      }}
      {...props}>
      {children}
    </Text>
  );
};
export const HighlightText = ({style, children, ...props}) => {
  return (
    <Text
      style={{
        fontFamily: 'Futura Bk',
        fontWeight: '700',
        fontSize: 16,
        color: '#0576f7',
        ...style,
      }}
      {...props}>
      {children}
    </Text>
  );
};
