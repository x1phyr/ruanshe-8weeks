"use client";

import React, { useState } from "react";
import {
  X,
  Lightbulb,
  BookOpen,
  Database,
  GitBranch,
  Cpu,
  Layers,
} from "lucide-react";
import { CaseStudy } from "@/lib/scoringHelper";

interface SolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCase?: CaseStudy | null;
}

export function SolutionModal({
  isOpen,
  onClose,
  currentCase,
}: SolutionModalProps) {
  const [activeTab, setActiveTab] = useState("case");

  if (!isOpen) return null;

  const tabs = [
    { id: "case", label: "本案例精粹", icon: Lightbulb },
    { id: "dfd", label: "试题一 DFD套路", icon: Layers },
    { id: "db", label: "试题二 数据库范式", icon: Database },
    { id: "uml", label: "试题三 UML关系", icon: GitBranch },
    { id: "alg", label: "试题四 C算法复杂度", icon: Cpu },
    { id: "dp", label: "试题五 23种设计模式", icon: BookOpen },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Lightbulb className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                下午大题解题套路与采分点精萃
              </h3>
              <p className="text-xs text-muted-foreground">
                软考软件设计师 · 五大下午必考大题秒杀指南与答题模板
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-border bg-surface/30 px-4 py-2 gap-1.5 scrollbar-thin">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-brand text-brand-foreground shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface"
                }`}
              >
                <Icon className="size-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs sm:text-sm leading-relaxed text-foreground/90">
          {activeTab === "case" && (
            <div className="space-y-4">
              <div className="p-4 bg-brand/10 border border-brand/20 rounded-xl space-y-1">
                <div className="text-xs font-bold text-brand">
                  当前选中案例：{currentCase?.id} · {currentCase?.title}
                </div>
                <div className="text-muted-foreground text-xs">
                  题型分类：{currentCase?.type}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-foreground">官方解题指引：</h4>
                {currentCase?.solvingTips && currentCase.solvingTips.length > 0 ? (
                  <div className="space-y-1.5 bg-surface/40 p-4 rounded-xl border border-border">
                    {currentCase.solvingTips.map((tip: string, idx: number) => (
                      <p key={idx} className="leading-relaxed">
                        {tip}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground bg-surface/40 p-4 rounded-xl border border-border">
                    遵循题目说明逐句提取关键词，比对题干与图示对应关系即可作答。
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "dfd" && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-brand">试题一：数据流图（DFD）解题套路</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-surface/50 p-3.5 rounded-xl border border-border space-y-1.5">
                  <strong className="text-amber-400">1. 外部实体查找诀窍：</strong>
                  <p className="text-muted-foreground">
                    通常在题干开头或前几句主语中出现，代表系统外部的人、部门或第三方外部系统（如“读者”、“管理员”、“支付网关”）。
                  </p>
                </div>
                <div className="bg-surface/50 p-3.5 rounded-xl border border-border space-y-1.5">
                  <strong className="text-amber-400">2. 数据存储推导：</strong>
                  <p className="text-muted-foreground">
                    题干中带有“表”、“文件”、“库”、“清单”、“记录”字样的名词，如“用户信息表”、“借阅记录文件”。
                  </p>
                </div>
                <div className="bg-surface/50 p-3.5 rounded-xl border border-border space-y-1.5">
                  <strong className="text-rose-400">3. 三大经典陷阱排查：</strong>
                  <p className="text-muted-foreground">
                    黑洞（有入无出）、奇迹（有出无入）、灰洞（输入不足以生成输出）。
                  </p>
                </div>
                <div className="bg-surface/50 p-3.5 rounded-xl border border-border space-y-1.5">
                  <strong className="text-emerald-400">4. 父子图平衡原则：</strong>
                  <p className="text-muted-foreground">
                    父图中输入输出数据流必须与子图中输入输出数据流保持严格一致，守恒不增不减。
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "db" && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-brand">试题二：数据库设计解题套路</h4>
              <div className="space-y-2 text-xs">
                <div className="bg-surface/50 p-3.5 rounded-xl border border-border space-y-1">
                  <strong className="text-blue-400">关系模式规范化范式判定：</strong>
                  <p className="text-muted-foreground">
                    1NF：所有属性均为原子不可拆分；
                    2NF：消除了非主属性对码的部分函数依赖；
                    3NF：消除了非主属性对码的传递函数依赖；
                    BCNF：消除主属性对码的部分与传递依赖。
                  </p>
                </div>
                <div className="bg-surface/50 p-3.5 rounded-xl border border-border space-y-1">
                  <strong className="text-emerald-400">联系转换与外键填充：</strong>
                  <p className="text-muted-foreground">
                    1:1 联系可将任一方主键加入另一方；1:n 联系必须将 1 端主键放入 n 端作为外键；m:n 联系必须独立建表，包含双方主键联合为主键。
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "uml" && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-brand">试题三：UML 建模与类间关系辨析</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-surface/50 p-3 rounded-xl border border-border">
                  <strong className="text-indigo-400">泛化 (Generalization)：</strong> 空心三角形+实线，继承关系。
                </div>
                <div className="bg-surface/50 p-3 rounded-xl border border-border">
                  <strong className="text-indigo-400">实现 (Realization)：</strong> 空心三角形+虚线，类实现接口。
                </div>
                <div className="bg-surface/50 p-3 rounded-xl border border-border">
                  <strong className="text-amber-400">聚合 (Aggregation)：</strong> 空心菱形+实线，整体与部分松耦合（班级与学生）。
                </div>
                <div className="bg-surface/50 p-3 rounded-xl border border-border">
                  <strong className="text-rose-400">组合 (Composition)：</strong> 实心菱形+实线，整体与部分强生命周期绑定（公司与部门）。
                </div>
              </div>
            </div>
          )}

          {activeTab === "alg" && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-brand">试题四：C 语言算法设计与复杂度</h4>
              <div className="space-y-2 text-xs">
                <div className="bg-surface/50 p-3.5 rounded-xl border border-border space-y-1">
                  <strong className="text-emerald-400">四大经典策略特征：</strong>
                  <p className="text-muted-foreground">
                    分治法（大问题拆小问题独立求解合并，如归并排序 O(nlogn)）；
                    动态规划（重叠子问题、最优子结构，填表记忆化）；
                    贪心法（每一步局部最优，不一定全局最优，如哈夫曼编码、Dijkstra）；
                    回溯法（深度优先搜索，尝试不通则回退，如八皇后问题）。
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "dp" && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-brand">试题五：23 种设计模式秒杀口诀</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-surface/50 p-3 rounded-xl border border-border space-y-1">
                  <strong className="text-blue-400">创建型 (5种)：</strong>
                  <p className="text-muted-foreground">单例、工厂方法、抽象工厂、建造者、原型。</p>
                </div>
                <div className="bg-surface/50 p-3 rounded-xl border border-border space-y-1">
                  <strong className="text-amber-400">结构型 (7种)：</strong>
                  <p className="text-muted-foreground">适配器、装饰器、代理、外观、桥接、组合、享元。</p>
                </div>
                <div className="bg-surface/50 p-3 rounded-xl border border-border space-y-1">
                  <strong className="text-purple-400">行为型 (11种)：</strong>
                  <p className="text-muted-foreground">策略、模板方法、观察者、状态、命令、责任链、迭代器等。</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
