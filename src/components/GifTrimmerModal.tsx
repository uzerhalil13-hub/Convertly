import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import Slider from '@react-native-community/slider';
import { COLORS } from '../constants/colors';

interface Props {
  visible: boolean;
  videoUri: string;
  duration: number;
  onConfirm: (startTime: number, endTime: number) => void;
  onCancel: () => void;
}

const MIN_GIF_DURATION = 0.5;
const MAX_GIF_DURATION = 10;

export default function GifTrimmerModal({
  visible,
  videoUri,
  duration,
  onConfirm,
  onCancel,
}: Props) {
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(Math.min(4, duration));
  const [isPlaying, setIsPlaying] = useState(false);

  const player = useVideoPlayer(videoUri, (player) => {
    player.loop = false;
    player.timeUpdateEventInterval = 0.1;
  });

  
  useEffect(() => {
    if (visible) {
      setStartTime(0);
      setEndTime(Math.min(4, duration));
      setIsPlaying(false);
      player.currentTime = 0;
      player.pause();
    }
  }, [visible, duration]);

  
  useEffect(() => {
    const subscription = player.addListener('timeUpdate', (payload) => {
      if (isPlaying && payload.currentTime >= endTime) {
        player.pause();
        player.currentTime = startTime;
        setIsPlaying(false);
      }
    });
    return () => subscription.remove();
  }, [player, isPlaying, endTime, startTime]);

  
  const handleStartChange = (value: number) => {
    const newStart = Math.max(0, Math.min(value, duration - MIN_GIF_DURATION));
    setStartTime(newStart);

    let newEnd = endTime;
    
    if (newStart + MIN_GIF_DURATION > newEnd) {
      newEnd = Math.min(duration, newStart + MIN_GIF_DURATION);
    }
    
    if (newEnd - newStart > MAX_GIF_DURATION) {
      newEnd = newStart + MAX_GIF_DURATION;
    }
    setEndTime(newEnd);

    player.currentTime = newStart;
    player.pause();
    setIsPlaying(false);
  };

  
  const handleEndChange = (value: number) => {
    const newEnd = Math.max(MIN_GIF_DURATION, Math.min(value, duration));
    setEndTime(newEnd);

    let newStart = startTime;
    
    if (newEnd - MIN_GIF_DURATION < newStart) {
      newStart = Math.max(0, newEnd - MIN_GIF_DURATION);
    }
    
    if (newEnd - newStart > MAX_GIF_DURATION) {
      newStart = Math.max(0, newEnd - MAX_GIF_DURATION);
    }
    setStartTime(newStart);

    player.currentTime = newEnd;
    player.pause();
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.currentTime = startTime;
      player.play();
    }
    setIsPlaying(!isPlaying);
  };

  const gifDuration = endTime - startTime;
  const isValid = gifDuration >= MIN_GIF_DURATION && gifDuration <= MAX_GIF_DURATION;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.panel}>
          <Text style={styles.title}>GIF Aralığını Seç</Text>
          <Text style={styles.subtitle}>
            Maksimum {MAX_GIF_DURATION} saniye seçebilirsin
          </Text>

          <View style={styles.videoContainer}>
            <VideoView
              style={styles.video}
              player={player}
              allowsFullscreen={false}
              allowsPictureInPicture={false}
              nativeControls={false}
            />
            <Pressable style={styles.playOverlay} onPress={togglePlayback}>
              <View style={styles.playButton}>
                <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
              </View>
            </Pressable>
          </View>

          {}
          <View style={styles.sliderContainer}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderLabel}>Başlangıç</Text>
              <Text style={styles.sliderValue}>{startTime.toFixed(1)}s</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration} 
              value={startTime}
              onValueChange={handleStartChange}
              minimumTrackTintColor={COLORS.accent}
              maximumTrackTintColor={COLORS.border}
              thumbTintColor={COLORS.accent}
              step={0.1}
            />
          </View>

          {}
          <View style={styles.sliderContainer}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderLabel}>Bitiş</Text>
              <Text style={styles.sliderValue}>{endTime.toFixed(1)}s</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration} 
              value={endTime}
              onValueChange={handleEndChange}
              minimumTrackTintColor={COLORS.accent}
              maximumTrackTintColor={COLORS.border}
              thumbTintColor={COLORS.accent}
              step={0.1}
            />
          </View>

          <View
            style={[
              styles.selectionInfo,
              !isValid && { backgroundColor: '#3A2020' },
            ]}
          >
            <Text style={styles.selectionLabel}>Seçilen Aralık:</Text>
            <Text
              style={[
                styles.selectionValue,
                !isValid && { color: COLORS.error },
              ]}
            >
              {startTime.toFixed(1)}s — {endTime.toFixed(1)}s ({gifDuration.toFixed(1)}s)
            </Text>
          </View>

          <View style={styles.buttonRow}>
            <Pressable style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelText}>İptal</Text>
            </Pressable>
            <Pressable
              style={[styles.confirmBtn, !isValid && { opacity: 0.5 }]}
              disabled={!isValid}
              onPress={() => onConfirm(startTime, endTime)}
            >
              <Text style={styles.confirmText}>GIF Oluştur</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: 20,
  },
  panel: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 24,
    padding: 20,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  video: { width: '100%', height: '100%' },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: { color: '#FFF', fontSize: 24 },
  sliderContainer: { marginTop: 12 },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  sliderLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  sliderValue: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  slider: { width: '100%', height: 36 },
  selectionInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    padding: 10,
    backgroundColor: COLORS.accentGlow,
    borderRadius: 10,
  },
  selectionLabel: { color: COLORS.textSecondary, fontSize: 13 },
  selectionValue: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  cancelBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  cancelText: { color: COLORS.textPrimary, fontWeight: '600' },
  confirmBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
  },
  confirmText: { color: '#FFF', fontWeight: '700' },
});