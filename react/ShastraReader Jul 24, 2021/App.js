// import { StatusBar } from 'expo-status-bar';
import 'react-native-gesture-handler';
import React from 'react';
import { SafeAreaView, Dimensions, StyleSheet, Text, View, StatusBar, Image, SectionList, Button, Pressable, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import AppLoading from 'expo-app-loading';

import { 
  useFonts,
  YanoneKaffeesatz_200ExtraLight,
  YanoneKaffeesatz_300Light,
  YanoneKaffeesatz_400Regular,
  YanoneKaffeesatz_500Medium,
  YanoneKaffeesatz_600SemiBold,
  YanoneKaffeesatz_700Bold 
} from '@expo-google-fonts/yanone-kaffeesatz'

import { AntDesign } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';

import {createStackNavigator} from '@react-navigation/stack';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';

import RenderHtml from 'react-native-render-html';
import * as FileSystem from "expo-file-system";
import * as SQLite from 'expo-sqlite';
import {Asset} from "expo-asset";



const width = Dimensions.get('window').width
const height = Dimensions.get('window').height
const textColor = '#333'
const mainColor = '#61dafb'


const Drawer = createDrawerNavigator()
const Stack = createStackNavigator()

//MAYBE rmove
async function removeDatabase() {
    console.log('removing db')
    const sqlDir = FileSystem.documentDirectory + "SQLite/";
FileSystem.deleteAsync(sqlDir + "bookBase.db", {idempotent: true});
}

async function openDatabase(flag) {
  console.log('i started bd stuff')//REMOVE
  if (!(await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'SQLite')).exists) {
    console.log('new directory')//REMOVE
    await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'SQLite');
  }
  console.log('starting download')//REMOVE
  if (flag == 1){
  await FileSystem.downloadAsync(
    Asset.fromModule(require('./assets/db/bookBase.db')).uri,
    FileSystem.documentDirectory + 'SQLite/bookBase.db'
  );

  }
  return SQLite.openDatabase('bookBase.db');
}

export default function App() {

let [fontsLoaded] = useFonts({
  YanoneKaffeesatz_200ExtraLight,
  YanoneKaffeesatz_300Light,
  YanoneKaffeesatz_400Regular,
  YanoneKaffeesatz_500Medium,
  YanoneKaffeesatz_600SemiBold,
  YanoneKaffeesatz_700Bold 
});

if (!fontsLoaded){
  return <AppLoading />
} else {

  return (
       <NavigationContainer>
        <Drawer.Navigator initialRouteName="Home" drawerContent={(props) => <DrawerListItem {...props} />}
          drawerContentOptions={{
            labelStyle: {
              color: textColor,
              fontSize: 25,
              fontFamily: 'YanoneKaffeesatz_400Regular',
            },
            itemStyle: {
              borderBottomWidth: 1,
              borderBottomColor: '#ebeaec',
              borderRadius: 0,
            },
            inactiveBackgroundColor: '#fff',
            activeBackgroundColor: '#d9d9d9',
          }}
          style
        >
          <Drawer.Screen name="Home" component={HomeScreen} options={{
            title: "Библиотека",
            headerTitleStyle: {
              color: 'red',
              fontSize: 30,
            },
            drawerIcon: ({focused, size}) => (
              <Entypo name="book" size={size} color={focused ? '#007aff' : '#000'} />
              )
          }} />
          <Drawer.Screen name="Search" component={Search} options={{
            title: 'Поиск',
            drawerIcon: ({focused, size}) => (
            <AntDesign name="search1" size={size} color={focused ? '#007aff' : '#000'} />
              )
          }} />
          <Drawer.Screen name="Bookmarks" component={Bookmarks} options={{
            title: 'Закладки',
            drawerIcon: ({focused, size}) => (
              <Entypo name="bookmark" size={size} color={focused ? '#007aff' : '#000'} />
              ),
          }} />
          <Drawer.Screen name="Settings" component={Settings} options={{
            title: 'Настройки',
            drawerIcon: ({focused, size}) => (
              <Feather name="settings" size={size} color={focused ? '#007aff' : '#000'} />
              )
          }} />
        </Drawer.Navigator>
      </NavigationContainer>
  );
}
}

function HomeScreen({ navigation }) {
  return (
    <Stack.Navigator screenOptions={{
        detachInactiveScreens: 'true',
        gestureDirection: 'horizontal',
        headerTitleAlign: 'Centerd',
        headerTitleStyle: {
          fontSize: 25,
          fontFamily: 'YanoneKaffeesatz_400Regular',
          fontWeight: '400',
        },
        headerStyle: {
          backgroundColor: mainColor,
        },
        headerTintColor: '#fff',
        headerRight: () => (
          <Pressable
            style={styles.headerBtn}
            onPress={() => navigation.navigate("Search")}
            hitSlop = {25}
            >
            <AntDesign name="search1" size={25} color="#fff" />
          </Pressable>
          ),
    }}>
      <Stack.Screen
      name="Library"
      component={Library}
      options={{
        headerTitle: 'Библиотека',
        headerLeft: () => (
          <Pressable
          style={styles.headerBtn}
          onPress={() => navigation.openDrawer()}
          hitSlop = {25}
          >
          <AntDesign name="bars" size={30} color="#fff" />
          </Pressable>
          )
      }}
      />
      <Stack.Screen
      name="ChapterScreen"
      component={ChapterScreen}
      options={({ route }) => ({ title: route.params.bookName })}
      />
      <Stack.Screen
      name="TextListScreen"
      component={TextListScreen}
      options={({ route }) => ({ title: route.params.chapterName })}
      />
      <Stack.Screen
      name="TextScreen"
      component={TextScreen}
      options={({ route }) => ({title: route.params.textName})}
      />
    </Stack.Navigator>
  );
}



function Library({ navigation }) {
  return(
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <StatusBar
        animated={true}
        backgroundColor={mainColor}
       />
       <BookList navigation={navigation}/>
    </View>
    )
}

  function BookList(props) {
    const [books, setBooks] = React.useState(null);
    var readyBooks = []
    var letters = []
    var db = null

    React.useEffect(() => {
      (async () => {
        db = await openDatabase(1)
        console.log('data base: ', db)
        console.log('state running')
        db.transaction((tx) => {
          tx.executeSql(
            'select * from books order by name asc;',
            [],
            (_, {rows: { _array } }) => setBooks(_array),
            (_, error) => console.log('erroR: ', error)
            );
        }, (error) => console.log('transtaction erroR: ', error))
        console.log('state ended')
      }).call()
    }, []);


    if (books){
      for (let i =0; i<books.length; i++){
        let firstLetter = books[i].name.substr(0, 1)
        if (letters.includes(firstLetter)){
          var index = letters.indexOf(firstLetter)
          console.log('index: ', index, 'letter: ', firstLetter)
          readyBooks[index].data.push(books[i])
          continue
        }
        letters.push(firstLetter)
        readyBooks.push({title: firstLetter, data: [books[i]]})
      }
      console.log(letters)
      for (let i =0; i<readyBooks.length; i++) console.log(readyBooks[i].title, readyBooks[i].data.length)
    }


    return(
      <View style={styles.bookList}>
            <SectionList
        sections={readyBooks}
        keyExtractor={(item, index) => item + index}
        renderItem={({ item }) => <BookListItem item={item} navigation={props.navigation} />}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectinoLetter}>{title}</Text>
        )}
      />
      </View>
      )
  }

  const BookListItem = ({ item, navigation }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("ChapterScreen", {
        bookId: item.id,
        bookName: item.name,
        bookImg: item.picture,
      })}
      >
      <View style={styles.bookListItem}>
          <Image
            style={styles.bookListImage}
            source={{ uri: item.smallPicture}}
          />
          <Text style={styles.listItemHeading}>{item.name}</Text>
          <AntDesign name="right" size={20} color="#b1b1b1" style={styles.listIcon} />
          <Text style={styles.bookListAuthor}>{item.author}</Text>
      </View>
    </TouchableOpacity>
  );



function ChapterScreen({ route, navigation }) {
  const { bookId, bookName, bookImg } = route.params
  return (
    <View style={styles.standardView}>
      <Image
        source={{uri: bookImg}}
        style={styles.chapterImage}
      />
      <ChapterList bookId={bookId} navigation={navigation}/>
    </View>
  );
}

  function ChapterList(props) { 
    const [chapters, setChapters] = React.useState(null);
    var db = null

    React.useEffect(() => {
      (async () => {
        db = await openDatabase(0)
        // db = SQLite.openDatabase('booksBase.db')
        console.log('state running')
        db.transaction((tx) => {
          tx.executeSql(
          'select * from chapters where book_id=? order by read_order asc;',
          [props.bookId],
          (_, {rows: { _array } }) => {setChapters(_array); console.log(_array)},
          (_, error) => console.log(error)
          );
        }, (error) => console.log('tRaNsAcTiOn eRrOr: ', error))
        console.log('state ended')
        console.log(chapters, props.bookId)

      }).call()

    }, []);

      return(
        <FlatList
          data={chapters}
          style={styles.chapterList}
          renderItem={({ item}) => <ChapterListItem item={item} navigation={props.navigation} />}
          keyExtractor={item => item.id.toString()}
        />
        )
  }

  const ChapterListItem = ({ item, navigation }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("TextListScreen", {
        chapterId: item.id,
        chapterName: item.name,
      })}
      >
      <View style={styles.listItem}>
          <Text style={[styles.listItemHeading, styles.chapterListItemHeading]}>{item.name}</Text>
          <AntDesign name="right" size={20} color="#b1b1b1" style={styles.listIcon} />
          <Text style={[styles.listAuthor, styles.chapterListAuthor]}>{item.sub_title}</Text>
      </View>
    </TouchableOpacity>
  );



function TextListScreen({ route, navigation}) {
  const {chapterId, chapterName} = route.params
  const [texts, setTexts] = React.useState(null);
  var db = null

    React.useEffect(() => {
      (async () => {
        db = await openDatabase(0)
        console.log('state running')
        db.transaction((tx) => {
          tx.executeSql(
          'select * from texts where chapter_id=? order by read_order asc;',
          [chapterId],
          (_, {rows: { _array } }) => {setTexts(_array); console.log(_array)

          if (_array.length == 1) {
            console.log('Only one text in chpater, opening it...')
            navigation.push("TextScreen", {
              textId: _array[0].id,
              textName: _array[0].name,
              textContent: _array[0].content,
            })
          }
          },
          (_, error) => console.log(error)
          );
        }, (error) => console.log('tRaNsAcTiOn eRrOr: ', error))
        console.log('state ended')
        console.log(texts, chapterId)

      }).call()

    }, []);

  return(
    <FlatList
      data={texts}
      style={styles.textList}
      renderItem={({ item }) => <TextListItem item={item} navigation={navigation} />}
      keyExtractor={item => item.id.toString()}
    />
    )
}

  const TextListItem = ({ item, navigation}) => (
    <TouchableOpacity
      onPress={() => navigation.push("TextScreen", {
        textId: item.id,
        textName: item.name,
        textContent: item.content,
      })}
    >    
      <View style={styles.listItem}>
          <Text style={styles.listItemHeading}>{item.name}</Text>
          <AntDesign name="right" size={20} color="#b1b1b1" style={styles.listIcon} />
          <Text style={[styles.listAuthor, styles.chapterListAuthor]}>{item.sub_title}</Text>
      </View>
    </TouchableOpacity>
    )

function TextScreen({ route, navigation }) {
  const { textId, textName, textContent } = route.params
  var htmlContent = {html: textContent}
  const tagsStyles = {
    p: {
      color: textColor,
      fontSize: 18,
    },
  }
  // var htmlContent = {html: ``}
  return(
    <ScrollView style={styles.mainText}>
      <RenderHtml
        contentWidth={width}
        source={htmlContent}
        enableExperimentalMarginCollapsing={true}
        tagsStyles={tagsStyles}
      />
    </ScrollView>
    )
}

const DrawerListItem = (props) => {
  return(
  <View>
    <Text style={styles.drawerAppName}>Шастра чакшуш</Text>
    <DrawerItemList {...props} />
  </View>
  )
  }

const Search = ({navigation}) => (
  <View>
    <Text>Search</Text>
  </View>
  )

const Bookmarks = ({navigation}) => (
  <View>
    <Text>Bookmarks</Text>
  </View>
  )

const Settings = ({navigation}) => (
  <View>
    <Text>Settings</Text>
  </View>
  )



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  mainHeader: {
    backgroundColor: mainColor,
    height: 50,
    width: width,
    paddingRight: 20,
    paddingLeft: 20,
    paddingTop: 10,
  },
  homeHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerIcon: {
    width: 25,
    height: 25,
  },
  headerText: {
    fontSize: 30,
    color: '#fff',
    fontFamily: 'YanoneKaffeesatz_400Regular',
    fontWeight: 'bold',
  },
  headerBtn: {
    marginHorizontal: 20,
  },
  drawerAppName: {
    fontFamily: 'YanoneKaffeesatz_400Regular',
    fontSize: 35,
    paddingTop: 10,
    paddingBottom: 20,
    paddingLeft: 10,
  },
  bookList: {
    flex: 1,
    width: width,
    paddingLeft: 10,
    backgroundColor: '#fff',
  },
  bookListItem: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: "#fafafa",
    marginLeft: 10,
    paddingRight: 20,
    paddingVertical: 15,
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  bookListImage: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  bookListAuthor: {
    position: 'absolute',
    fontFamily: 'YanoneKaffeesatz_400Regular',
    fontSize: 18,
    bottom: 5,
    left: 65,
    opacity: .5,
  },
  sectinoLetter: {
    color: textColor,
    fontSize: 30,
    fontFamily: 'YanoneKaffeesatz_400Regular',
    marginVertical: 8,
    paddingLeft: 10,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: "#fafafa",
    paddingLeft: 10,
    paddingRight: 20,
    paddingBottom: 18,
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  listItemHeading: {
    color: textColor,
    fontFamily: 'YanoneKaffeesatz_400Regular',
    fontSize: 24,
    letterSpacing: 1.3,
    paddingBottom: 10,
  },
  listAuthor: {
    position: 'absolute',
    fontFamily: 'YanoneKaffeesatz_400Regular',
    fontSize: 18,
    bottom: 5,
    left: 10,
    opacity: .5,
  },
  listIcon: {
    position: 'absolute',
    right: 15,
    width: 15,
    height: 25,
  },
  chapterImage: {
    width: width,
    height: 180,
  },
  chapterList: {
    marginTop: 10,
  },
  chapterListItemHeading: {
    paddingLeft: 10,
  },
  chapterListAuthor: {
    paddingLeft: 10,
  },
  mainText: {
    paddingHorizontal: 15,
    paddingVertical: -10,
    marginVertical: 10,
  },
  body: {
    color: textColor,
  },
  p: {
    color: textColor,
    backgroundColor: 'red',
    fontSize: 20,
  },
  span: {
    fontStyle: 'italic',
  },
  em: {
    fontSize: 20,
    textAlign: 'right',
  },
  standardView: {
    backgroundColor: '#fafafa',
    flex: 1,
  }
});
