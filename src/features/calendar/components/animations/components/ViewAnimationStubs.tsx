'use client';

import { memo, type ReactNode } from 'react';

/**
 * アニメーションスタブコンポーネント
 *
 * framer-motion依存を削除したため、単純なラッパーとして実装
 * 将来的にアニメーションを追加する場合はここを拡張
 */

interface ViewAnimationProps {
  children: ReactNode;
  viewType?: string;
  className?: string;
}

// CalendarViewAnimation - ビュー切り替えアニメーション（スタブ）
export const CalendarViewAnimation = memo(function CalendarViewAnimation({
  children,
  className,
}: ViewAnimationProps) {
  return <div className={className}>{children}</div>;
});

// ViewTransition - 汎用ビュートランジション（スタブ）
export const ViewTransition = memo(function ViewTransition({
  children,
  className,
}: ViewAnimationProps) {
  return <div className={className}>{children}</div>;
});

// AdvancedViewTransition - 高度なビュートランジション（スタブ）
export const AdvancedViewTransition = memo(function AdvancedViewTransition({
  children,
  className,
}: ViewAnimationProps) {
  return <div className={className}>{children}</div>;
});

// FadeTransition - フェードトランジション（スタブ）
export const FadeTransition = memo(function FadeTransition({
  children,
  className,
}: ViewAnimationProps) {
  return <div className={className}>{children}</div>;
});

// SlideTransition - スライドトランジション（スタブ）
export const SlideTransition = memo(function SlideTransition({
  children,
  className,
}: ViewAnimationProps) {
  return <div className={className}>{children}</div>;
});

// AdvancedSlideTransition - 高度なスライドトランジション（スタブ）
export const AdvancedSlideTransition = memo(function AdvancedSlideTransition({
  children,
  className,
}: ViewAnimationProps) {
  return <div className={className}>{children}</div>;
});

interface AnimationProps {
  children: ReactNode;
  className?: string;
}

// AnimationWrapper - アニメーションラッパー（スタブ）
export const AnimationWrapper = memo(function AnimationWrapper({
  children,
  className,
}: AnimationProps) {
  return <div className={className}>{children}</div>;
});

// OptimizedListAnimation - 最適化リストアニメーション（スタブ）
export const OptimizedListAnimation = memo(function OptimizedListAnimation({
  children,
  className,
}: AnimationProps) {
  return <div className={className}>{children}</div>;
});

// SkeletonAnimation - スケルトンアニメーション（スタブ）
export const SkeletonAnimation = memo(function SkeletonAnimation({
  children,
  className,
}: AnimationProps) {
  return <div className={className}>{children}</div>;
});

// PerformanceIndicator - パフォーマンスインジケーター（スタブ）
export const PerformanceIndicator = memo(function PerformanceIndicator({
  children,
  className,
}: AnimationProps) {
  return <div className={className}>{children}</div>;
});

// EventCollapse - イベント折りたたみ（スタブ）
export const EventCollapse = memo(function EventCollapse({ children, className }: AnimationProps) {
  return <div className={className}>{children}</div>;
});

// TaskCreateAnimation - タスク作成アニメーション（スタブ）
export const TaskCreateAnimation = memo(function TaskCreateAnimation({
  children,
  className,
}: AnimationProps) {
  return <div className={className}>{children}</div>;
});

// TaskDragAnimation - タスクドラッグアニメーション（スタブ）
export const TaskDragAnimation = memo(function TaskDragAnimation({
  children,
  className,
}: AnimationProps) {
  return <div className={className}>{children}</div>;
});

// TaskHoverTooltip - タスクホバーツールチップ（スタブ）
export const TaskHoverTooltip = memo(function TaskHoverTooltip({
  children,
  className,
}: AnimationProps) {
  return <div className={className}>{children}</div>;
});

// SpringAnimation - スプリングアニメーション（スタブ）
export const SpringAnimation = memo(function SpringAnimation({
  children,
  className,
}: AnimationProps) {
  return <div className={className}>{children}</div>;
});

// StaggeredAnimation - スタガードアニメーション（スタブ）
export const StaggeredAnimation = memo(function StaggeredAnimation({
  children,
  className,
}: AnimationProps) {
  return <div className={className}>{children}</div>;
});

// TouchAnimation - タッチアニメーション（スタブ）
export const TouchAnimation = memo(function TouchAnimation({
  children,
  className,
}: AnimationProps) {
  return <div className={className}>{children}</div>;
});

// Parallax - パララックス効果（スタブ）
export const Parallax = memo(function Parallax({ children, className }: AnimationProps) {
  return <div className={className}>{children}</div>;
});
