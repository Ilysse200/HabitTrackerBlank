import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BlogDetailScreen({ route, navigation }) {
  const { blog } = route.params;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fetchBlogs = async () =>{


    const response = await fetch("http://192.168.0.107:3000/blog/getBlogs");
    //Check what the response returns 
    if(!response.ok){
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const formatResponse = await response.json();
    console.log(JSON.stringify(data, null, 2));
    
  }


  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this blog post: "${blog.title}"\n\n${blog.content.substring(0, 200)}...`,
        title: blog.title,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* {blog.image && (
        <Image source={{ uri: blog.image }} style={styles.heroImage} />
      )} */}
      
      <View style={styles.content}>
        <Text style={styles.title}>{blog.title}</Text>
        
        <View style={styles.metaContainer}>
          <View style={styles.authorInfo}>
            <Ionicons name="person-circle" size={20} color="#007AFF" />
            <Text style={styles.authorName}>{blog.author.name}</Text>
          </View>
          <View style={styles.dateInfo}>
            <Ionicons name="time" size={16} color="#666" />
            <Text style={styles.date}>{formatDate(blog.createdAt)}</Text>
          </View>
        </View>



        <View style={styles.content}>
          <Ionicons name="document-text" size={20} color="#007AFF"/>
          <Text style={styles.contentText}>{blog.body}</Text>
        </View>
        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color="#007AFF" />
            <Text style={styles.shareText}>Share</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <Text style={styles.contentText}>{blog.content}</Text>

        {/* {blog.tags && blog.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            <Text style={styles.tagsTitle}>Tags:</Text>
            <View style={styles.tagsWrapper}>
              {blog.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )} */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  heroImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  content: {
    padding: 20,
  },
  textContent:{
    fontSize:16,
    marginTop:2,
    fontWeight:100,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 36,
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 8,
    fontWeight: '600',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  shareText: {
    color: '#007AFF',
    marginLeft: 6,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    textAlign: 'justify',
  },
  tagsContainer: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  tagsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});