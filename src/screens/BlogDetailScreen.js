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

  // Utility function to get author information
  const getAuthorInfo = (blog) => {
    // Check if there's a direct author object
    if (blog.author && blog.author.name) {
      return {
        name: blog.author.name,
        email: blog.author.email,
        role: blog.author.role
      };
    }
    
    // Check if there are blogAuthors (array)
    if (blog.blogAuthors && blog.blogAuthors.length > 0) {
      const firstAuthor = blog.blogAuthors[0];
      return {
        name: firstAuthor.name,
        email: firstAuthor.email,
        role: firstAuthor.role
      };
    }
    
    // Fallback
    return {
      name: 'Unknown Author',
      email: '',
      role: 'contributor'
    };
  };

  // Utility function to get blog content
  const getBlogContent = (blog) => {
    // Prefer 'body' field as that's what your API returns
    return blog.body || blog.content || 'No content available';
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const fetchBlogs = async () => {
    try {
      const response = await fetch("http://172.20.10.2:3000/blog/getBlogs");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const formatResponse = await response.json();
      console.log(JSON.stringify(formatResponse, null, 2)); // Fixed: was 'data' instead of 'formatResponse'
      
      return formatResponse;
    } catch (error) {
      console.error('Error fetching blogs:', error);
      throw error;
    }
  };

  const handleShare = async () => {
    try {
      const content = getBlogContent(blog);
      const shareContent = content.length > 200 ? content.substring(0, 200) + '...' : content;
      
      await Share.share({
        message: `Check out this blog post: "${blog.title}"\n\n${shareContent}`,
        title: blog.title,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  // Get normalized data
  const authorInfo = getAuthorInfo(blog);
  const blogContent = getBlogContent(blog);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {blog.image && (
        <Image source={{ uri: blog.image }} style={styles.heroImage} />
      )}
      
      <View style={styles.content}>
        <Text style={styles.title}>{blog.title || 'Untitled'}</Text>
        
        <View style={styles.metaContainer}>
          <View style={styles.authorInfo}>
            <Ionicons name="person-circle" size={20} color="#007AFF" />
            <Text style={styles.authorName}>{authorInfo.name}</Text>
            {authorInfo.role && (
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{authorInfo.role}</Text>
              </View>
            )}
          </View>
          {/* <View style={styles.dateInfo}>
            <Ionicons name="time" size={16} color="#666" />
            <Text style={styles.date}>{formatDate(blog.createdAt)}</Text>
          </View> */}
        </View>

        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color="#007AFF" />
            <Text style={styles.shareText}>Share</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.contentContainer}>
          <Ionicons name="document-text" size={20} color="#007AFF" style={styles.contentIcon} />
          <Text style={styles.contentText}>{blogContent}</Text>
        </View>

        {/* Display additional metadata if available */}
        {blog.updatedAt && blog.updatedAt !== blog.createdAt && (
          <View style={styles.updateInfo}>
            <Ionicons name="create-outline" size={16} color="#666" />
            <Text style={styles.updateText}>
              Last updated: {formatDate(blog.updatedAt)}
            </Text>
          </View>
        )}

        {/* Show multiple authors if available */}
        {blog.blogAuthors && blog.blogAuthors.length > 1 && (
          <View style={styles.coAuthorsContainer}>
            <Text style={styles.coAuthorsTitle}>Co-authors:</Text>
            {blog.blogAuthors.slice(1).map((author, index) => (
              <View key={index} style={styles.coAuthor}>
                <Ionicons name="person" size={16} color="#007AFF" />
                <Text style={styles.coAuthorName}>{author.name}</Text>
                <Text style={styles.coAuthorRole}>({author.role})</Text>
              </View>
            ))}
          </View>
        )}
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
    flexWrap: 'wrap',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 8,
    fontWeight: '600',
  },
  roleBadge: {
    backgroundColor: '#e8f4fd',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  roleText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
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
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  contentIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    textAlign: 'justify',
    flex: 1,
  },
  updateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  updateText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    fontStyle: 'italic',
  },
  coAuthorsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  coAuthorsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  coAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  coAuthorName: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 6,
    fontWeight: '500',
  },
  coAuthorRole: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
});