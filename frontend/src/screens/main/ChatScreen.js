import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { ListSkeleton } from "../../components/common/SkeletonLoader";
import fonts from "../../theme/fonts";
import { Ionicons } from "@expo/vector-icons";
import { fetchChats, sendMessage } from "../../services/api";

function ChatScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);

  const loadMessages = useCallback(async () => {
    try {
      const res = await fetchChats();
      setMessages(res.chats || res.messages || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
    // Poll for new messages every 10 seconds
    const interval = setInterval(loadMessages, 10000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  const handleSend = useCallback(async () => {
    const msg = text.trim();
    if (!msg || sending) return;
    try {
      setSending(true);
      setText("");
      // Send to admin (in a real app, receiverId would be dynamic)
      await sendMessage("admin", msg);
      loadMessages();
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  }, [text, sending, loadMessages]);

  const renderMessage = useCallback(
    ({ item }) => {
      const isMe = item.sender === user?._id || item.sender?._id === user?._id;
      return (
        <View
          style={[
            styles.bubble,
            isMe ? styles.bubbleRight : styles.bubbleLeft,
            {
              backgroundColor: isMe ? theme.primary : theme.surface,
              borderColor: isMe ? theme.primary : theme.border,
            },
          ]}
        >
          <Text
            style={[
              styles.msgText,
              { color: isMe ? "#FFF" : theme.textPrimary },
            ]}
          >
            {item.message || item.text}
          </Text>
          <Text
            style={[
              styles.msgTime,
              { color: isMe ? "rgba(255,255,255,0.7)" : theme.textMuted },
            ]}
          >
            {item.createdAt
              ? new Date(item.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
          </Text>
        </View>
      );
    },
    [theme, user]
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ListSkeleton count={8} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, idx) => item._id || idx.toString()}
        contentContainerStyle={styles.chatList}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="chatbubbles-outline" size={56} color={theme.textMuted} />
            <Text style={[styles.empty, { color: theme.textMuted }]}>
              Start a conversation with support
            </Text>
          </View>
        }
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        initialNumToRender={20}
      />
      <View
        style={[
          styles.inputBar,
          { backgroundColor: theme.surface, borderTopColor: theme.border },
        ]}
      >
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor={theme.textMuted}
          style={[
            styles.textInput,
            { backgroundColor: theme.background, color: theme.textPrimary, borderColor: theme.border },
          ]}
          multiline
          maxLength={500}
        />
        <Pressable
          onPress={handleSend}
          disabled={sending || !text.trim()}
          style={({ pressed }) => [
            styles.sendBtn,
            {
              backgroundColor: text.trim() ? theme.primary : theme.border,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Ionicons name="send" size={18} color="#FFF" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  chatList: { paddingHorizontal: 16, paddingVertical: 12 },
  bubble: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
    maxWidth: "78%",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleLeft: { alignSelf: "flex-start", borderBottomLeftRadius: 4 },
  bubbleRight: { alignSelf: "flex-end", borderBottomRightRadius: 4 },
  msgText: { fontSize: fonts.sizes.md, lineHeight: 20 },
  msgTime: { fontSize: fonts.sizes.xs, marginTop: 4, textAlign: "right" },
  inputBar: {
    alignItems: "flex-end",
    borderTopWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  textInput: {
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    fontSize: fonts.sizes.md,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sendBtn: {
    alignItems: "center",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    marginLeft: 8,
    width: 40,
  },
  emptyWrap: { alignItems: "center", marginTop: 80 },
  empty: { fontSize: fonts.sizes.md, marginTop: 12, textAlign: "center" },
});

export default memo(ChatScreen);
