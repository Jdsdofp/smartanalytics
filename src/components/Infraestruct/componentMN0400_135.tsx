//src/components/Infraestruct/componentMN0400_135.tsx

import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { ShieldCheckIcon } from '@heroicons/react/24/solid';
import { useRiskManagement } from '../../hooks/useRiskManagement';
import { ArrowDownCircleIcon, ArrowsRightLeftIcon, ArrowTrendingUpIcon, ArrowUpCircleIcon, Battery100Icon, BellAlertIcon, BoltIcon, ChartBarIcon, Cog6ToothIcon, CogIcon, DocumentTextIcon, ExclamationTriangleIcon, MapPinIcon, PauseCircleIcon, RocketLaunchIcon, SignalIcon } from '@heroicons/react/24/outline';

export default function RisksManagement() {
    const [activeTab, setActiveTab] = useState<string>('overview');
    const [lastUpdate, setLastUpdate] = useState<string>('');

    // Company ID - você pode pegar do contexto/auth ou props

    // 🎣 Usar o hook customizado
    const {
        kpis,
        //stateKpis,
        timeline,
        stateDistribution,
        events,
        ranking,
        locations,
        motionTimeline,
        impactDistribution,
        immobilityAlerts,
        batteryDistribution,
        loading,
        error,
    } = useRiskManagement(activeTab, true);

    // Chart refs
    const riskTimelineRef = useRef<HTMLDivElement>(null);
    const eventTypePieRef = useRef<HTMLDivElement>(null);
    const tempRiskRef = useRef<HTMLDivElement>(null);
    const batteryStatusRef = useRef<HTMLDivElement>(null);
    const gforceTimelineRef = useRef<HTMLDivElement>(null);
    const impactDistRef = useRef<HTMLDivElement>(null);
    const gforceHeatmapRef = useRef<HTMLDivElement>(null);
    const stateDistributionRef = useRef<HTMLDivElement>(null);
    const stateChangesRef = useRef<HTMLDivElement>(null);
    const stateTrendsAreaRef = useRef<HTMLDivElement>(null);
    const stateRiskPieRef = useRef<HTMLDivElement>(null);
    const gpsMapRef = useRef<HTMLDivElement>(null);

    const chartsRef = useRef<{ [key: string]: echarts.ECharts }>({});

    // Update timestamp
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setLastUpdate(now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }));
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // Atualizar gráficos quando os dados mudarem
    useEffect(() => {
        if (!kpis || loading) return;

        // Risk Timeline Chart com dados reais
        if (riskTimelineRef.current && timeline.length > 0) {
            const chart = echarts.init(riskTimelineRef.current);
            chartsRef.current.riskTimeline = chart;

            const hours = timeline.map(t => {
                const date = new Date(t.hour_bucket);
                return `${String(date.getHours()).padStart(2, '0')}:00`;
            });

            const criticalData = timeline.map(t => t.badges_critical_state);
            const highData = timeline.map(t => t.badges_high_risk_state);
            const mediumData = timeline.map(t => t.badges_medium_risk_state);
            const lowData = timeline.map(t => t.badges_low_risk_state);

            chart.setOption({
                backgroundColor: 'transparent',
                tooltip: {
                    trigger: 'axis',
                    backgroundColor: 'rgba(15, 23, 42, 0.98)',
                    borderColor: '#475569',
                    borderWidth: 1,
                    textStyle: { color: '#e2e8f0', fontSize: 13 },
                    axisPointer: { type: 'cross', label: { backgroundColor: '#667eea' } }
                },
                legend: {
                    data: ['Critical', 'High Risk', 'Medium Risk', 'Low Risk'],
                    textStyle: { color: '#94a3b8', fontSize: 12 },
                    top: '5%',
                    itemGap: 20
                },
                grid: { left: '3%', right: '4%', bottom: '5%', top: '18%', containLabel: true },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: hours,
                    axisLabel: { color: '#94a3b8', interval: 2, rotate: 45, fontSize: 11 },
                    axisLine: { lineStyle: { color: '#475569' } }
                },
                yAxis: {
                    type: 'value',
                    name: 'Badges',
                    nameTextStyle: { color: '#94a3b8', fontSize: 12 },
                    axisLabel: { color: '#94a3b8', fontSize: 11 },
                    splitLine: { lineStyle: { color: '#334155', type: 'dashed' } }
                },
                series: [
                    {
                        name: 'Critical',
                        type: 'line',
                        smooth: true,
                        symbol: 'circle',
                        symbolSize: 8,
                        data: criticalData,
                        lineStyle: { width: 3, color: '#dc2626' },
                        itemStyle: { color: '#dc2626' },
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: 'rgba(220, 38, 38, 0.5)' },
                                { offset: 1, color: 'rgba(220, 38, 38, 0)' }
                            ])
                        }
                    },
                    {
                        name: 'High Risk',
                        type: 'line',
                        smooth: true,
                        symbol: 'circle',
                        symbolSize: 8,
                        data: highData,
                        lineStyle: { width: 3, color: '#f59e0b' },
                        itemStyle: { color: '#f59e0b' },
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: 'rgba(245, 158, 11, 0.3)' },
                                { offset: 1, color: 'rgba(245, 158, 11, 0)' }
                            ])
                        }
                    },
                    {
                        name: 'Medium Risk',
                        type: 'line',
                        smooth: true,
                        data: mediumData,
                        lineStyle: { width: 2, color: '#3b82f6' },
                        itemStyle: { color: '#3b82f6' }
                    },
                    {
                        name: 'Low Risk',
                        type: 'line',
                        smooth: true,
                        data: lowData,
                        lineStyle: { width: 2, color: '#10b981' },
                        itemStyle: { color: '#10b981' }
                    }
                ]
            });
        }

        // State Distribution Pie Chart
        if (eventTypePieRef.current && stateDistribution.length > 0) {
            const chart = echarts.init(eventTypePieRef.current);
            chartsRef.current.eventTypePie = chart;

            const pieData = stateDistribution.map(item => ({
                value: item.badge_count,
                name: item.state_name,
                itemStyle: { color: item.color }
            }));

            chart.setOption({
                backgroundColor: 'transparent',
                tooltip: {
                    trigger: 'item',
                    backgroundColor: 'rgba(15, 23, 42, 0.98)',
                    borderColor: '#475569',
                    textStyle: { color: '#e2e8f0' },
                    formatter: '{b}: {c} ({d}%)'
                },
                legend: {
                    orient: 'vertical',
                    right: '5%',
                    top: 'center',
                    textStyle: { color: '#94a3b8', fontSize: 12 },
                    itemGap: 12
                },
                series: [{
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['35%', '50%'],
                    avoidLabelOverlap: true,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: '#0f172a',
                        borderWidth: 2
                    },
                    label: {
                        show: true,
                        position: 'outside',
                        formatter: '{b}\n{c}',
                        color: '#e2e8f0',
                        fontSize: 11
                    },
                    data: pieData,
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 15,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.7)'
                        }
                    }
                }]
            });
        }

        // Temperature Risk Gauge
        if (tempRiskRef.current && kpis) {
            const chart = echarts.init(tempRiskRef.current);
            chartsRef.current.tempRisk = chart;

            chart.setOption({
                backgroundColor: 'transparent',
                series: [{
                    type: 'gauge',
                    startAngle: 180,
                    endAngle: 0,
                    center: ['50%', '75%'],
                    radius: '90%',
                    min: -20,
                    max: 60,
                    splitNumber: 8,
                    axisLine: {
                        lineStyle: {
                            width: 30,
                            color: [
                                [0.125, '#0ea5e9'],
                                [0.375, '#3b82f6'],
                                [0.625, '#10b981'],
                                [0.875, '#f59e0b'],
                                [1, '#dc2626']
                            ]
                        }
                    },
                    pointer: {
                        itemStyle: {
                            color: '#f97316',
                            shadowColor: 'rgba(249, 115, 22, 0.5)',
                            shadowBlur: 10
                        },
                        width: 8
                    },
                    axisTick: { show: false },
                    splitLine: {
                        length: 18,
                        lineStyle: { width: 2, color: '#999' }
                    },
                    axisLabel: {
                        color: '#94a3b8',
                        fontSize: 12,
                        distance: -60,
                        formatter: '{value}°C'
                    },
                    detail: {
                        fontSize: 42,
                        offsetCenter: [0, '70%'],
                        valueAnimation: true,
                        formatter: '{value}°C',
                        color: '#e2e8f0',
                        fontWeight: 'bold'
                    },
                    title: {
                        offsetCenter: [0, '90%'],
                        fontSize: 14,
                        color: '#94a3b8'
                    },
                    data: [{ value: kpis.avg_temperature, name: 'Avg Temperature' }]
                }]
            });
        }

        // Battery Status Bar Chart
        if (batteryStatusRef.current && batteryDistribution.length > 0) {
            const chart = echarts.init(batteryStatusRef.current);
            chartsRef.current.batteryStatus = chart;

            const categories = batteryDistribution.map(item => item.range_label);
            const values = batteryDistribution.map(item => ({
                value: item.badge_count,
                itemStyle: {
                    color: item.range_label.includes('Critical') ? '#dc2626' :
                        item.range_label.includes('Low') ? '#f59e0b' :
                            item.range_label.includes('Medium') ? '#3b82f6' : '#10b981'
                }
            }));

            chart.setOption({
                backgroundColor: 'transparent',
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'shadow' },
                    backgroundColor: 'rgba(15, 23, 42, 0.98)',
                    borderColor: '#475569',
                    textStyle: { color: '#e2e8f0' }
                },
                grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
                xAxis: {
                    type: 'category',
                    data: categories,
                    axisLabel: { color: '#94a3b8', fontSize: 11 },
                    axisLine: { lineStyle: { color: '#475569' } }
                },
                yAxis: {
                    type: 'value',
                    name: 'Badges',
                    nameTextStyle: { color: '#94a3b8' },
                    axisLabel: { color: '#94a3b8' },
                    splitLine: { lineStyle: { color: '#334155', type: 'dashed' } }
                },
                series: [{
                    type: 'bar',
                    barWidth: '60%',
                    data: values,
                    itemStyle: { borderRadius: [6, 6, 0, 0] },
                    label: {
                        show: true,
                        position: 'top',
                        color: '#e2e8f0',
                        fontWeight: 'bold',
                        fontSize: 14
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 12,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }]
            });
        }

        // G-Force Timeline (Motion Tab)
        if (gforceTimelineRef.current && motionTimeline.length > 0) {
            const chart = echarts.init(gforceTimelineRef.current);
            chartsRef.current.gforceTimeline = chart;

            const hours = motionTimeline.map(t => {
                const date = new Date(t.hour_bucket);
                return `${String(date.getHours()).padStart(2, '0')}:00`;
            });

            const maxGforceData = motionTimeline.map(t => t.max_gforce);
            const avgGforceData = motionTimeline.map(t => t.avg_gforce);
            const impactCountData = motionTimeline.map(t => t.impact_count);

            chart.setOption({
                backgroundColor: 'transparent',
                tooltip: {
                    trigger: 'axis',
                    backgroundColor: 'rgba(15, 23, 42, 0.98)',
                    borderColor: '#475569',
                    textStyle: { color: '#e2e8f0' }
                },
                legend: {
                    data: ['Max G-Force', 'Avg G-Force', 'Impact Count'],
                    textStyle: { color: '#94a3b8' },
                    top: '5%'
                },
                grid: { left: '3%', right: '5%', bottom: '5%', top: '15%', containLabel: true },
                xAxis: {
                    type: 'category',
                    data: hours,
                    axisLabel: { color: '#94a3b8', interval: 2, rotate: 45 },
                    axisLine: { lineStyle: { color: '#475569' } }
                },
                yAxis: [
                    {
                        type: 'value',
                        name: 'G-Force',
                        nameTextStyle: { color: '#94a3b8' },
                        axisLabel: { color: '#94a3b8', formatter: '{value}g' },
                        splitLine: { lineStyle: { color: '#334155' } }
                    },
                    {
                        type: 'value',
                        name: 'Count',
                        nameTextStyle: { color: '#94a3b8' },
                        axisLabel: { color: '#94a3b8' },
                        splitLine: { show: false }
                    }
                ],
                series: [
                    {
                        name: 'Max G-Force',
                        type: 'line',
                        data: maxGforceData,
                        itemStyle: { color: '#8b5cf6' },
                        smooth: true,
                        lineStyle: { width: 2 }
                    },
                    {
                        name: 'Avg G-Force',
                        type: 'line',
                        data: avgGforceData,
                        itemStyle: { color: '#3b82f6' },
                        smooth: true,
                        lineStyle: { width: 2 }
                    },
                    {
                        name: 'Impact Count',
                        type: 'bar',
                        yAxisIndex: 1,
                        data: impactCountData,
                        itemStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: '#f59e0b' },
                                { offset: 1, color: '#ea580c' }
                            ]),
                            borderRadius: [4, 4, 0, 0]
                        }
                    }
                ]
            });
        }

        // Impact Distribution (Motion Tab)
        if (impactDistRef.current && impactDistribution.length > 0) {
            const chart = echarts.init(impactDistRef.current);
            chartsRef.current.impactDist = chart;

            const pieData = impactDistribution.map(item => ({
                value: item.count,
                name: item.severity_level,
                itemStyle: { color: item.color }
            }));

            chart.setOption({
                backgroundColor: 'transparent',
                tooltip: {
                    trigger: 'item',
                    backgroundColor: 'rgba(15, 23, 42, 0.98)',
                    borderColor: '#475569',
                    textStyle: { color: '#e2e8f0' }
                },
                legend: { bottom: '5%', textStyle: { color: '#94a3b8' } },
                series: [{
                    type: 'pie',
                    radius: ['45%', '75%'],
                    data: pieData,
                    label: { color: '#e2e8f0', formatter: '{b}\n{c}' },
                    itemStyle: { borderRadius: 8, borderColor: '#0f172a', borderWidth: 2 }
                }]
            });
        }

        // State Distribution Bar Chart (State Tab)
        if (stateDistributionRef.current && stateDistribution.length > 0) {
            const chart = echarts.init(stateDistributionRef.current);
            chartsRef.current.stateDistribution = chart;

            const stateNames = stateDistribution.map(item => item.state_name);
            const stateCounts = stateDistribution.map(item => ({
                value: item.badge_count,
                itemStyle: { color: item.color }
            }));

            chart.setOption({
                backgroundColor: 'transparent',
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'shadow' },
                    backgroundColor: 'rgba(15, 23, 42, 0.98)',
                    borderColor: '#475569',
                    textStyle: { color: '#e2e8f0' }
                },
                grid: { left: '5%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
                xAxis: {
                    type: 'value',
                    name: 'Badges',
                    nameTextStyle: { color: '#94a3b8' },
                    axisLabel: { color: '#94a3b8' },
                    splitLine: { lineStyle: { color: '#334155' } }
                },
                yAxis: {
                    type: 'category',
                    data: stateNames,
                    axisLabel: { color: '#94a3b8', fontSize: 11 },
                    axisLine: { lineStyle: { color: '#475569' } }
                },
                series: [{
                    type: 'bar',
                    data: stateCounts,
                    barWidth: '60%',
                    label: {
                        show: true,
                        position: 'right',
                        color: '#e2e8f0',
                        fontWeight: 'bold'
                    },
                    itemStyle: { borderRadius: [0, 4, 4, 0] }
                }]
            });
        }

        // State Changes Timeline (State Tab)
        if (stateChangesRef.current && timeline.length > 0) {
            const chart = echarts.init(stateChangesRef.current);
            chartsRef.current.stateChanges = chart;

            const hours = timeline.map(t => {
                const date = new Date(t.hour_bucket);
                return `${String(date.getHours()).padStart(2, '0')}:00`;
            });

            chart.setOption({
                backgroundColor: 'transparent',
                tooltip: {
                    trigger: 'axis',
                    backgroundColor: 'rgba(15, 23, 42, 0.98)',
                    borderColor: '#475569',
                    textStyle: { color: '#e2e8f0' },
                    axisPointer: { type: 'cross' }
                },
                legend: {
                    data: ['NORMAL', 'HIGH RISK', 'MEDIUM RISK', 'CRITICAL'],
                    textStyle: { color: '#94a3b8' },
                    top: '5%'
                },
                grid: { left: '3%', right: '4%', bottom: '5%', top: '15%', containLabel: true },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: hours,
                    axisLabel: { color: '#94a3b8', interval: 5, rotate: 45 },
                    axisLine: { lineStyle: { color: '#475569' } }
                },
                yAxis: {
                    type: 'value',
                    name: 'Badges',
                    nameTextStyle: { color: '#94a3b8' },
                    axisLabel: { color: '#94a3b8' },
                    splitLine: { lineStyle: { color: '#334155' } }
                },
                series: [
                    {
                        name: 'NORMAL',
                        type: 'line',
                        stack: 'total',
                        data: timeline.map(t => t.badges_low_risk_state),
                        itemStyle: { color: '#10b981' },
                        areaStyle: {},
                        smooth: true
                    },
                    {
                        name: 'MEDIUM RISK',
                        type: 'line',
                        stack: 'total',
                        data: timeline.map(t => t.badges_medium_risk_state),
                        itemStyle: { color: '#3b82f6' },
                        areaStyle: {},
                        smooth: true
                    },
                    {
                        name: 'HIGH RISK',
                        type: 'line',
                        stack: 'total',
                        data: timeline.map(t => t.badges_high_risk_state),
                        itemStyle: { color: '#f59e0b' },
                        areaStyle: {},
                        smooth: true
                    },
                    {
                        name: 'CRITICAL',
                        type: 'line',
                        stack: 'total',
                        data: timeline.map(t => t.badges_critical_state),
                        itemStyle: { color: '#dc2626' },
                        areaStyle: {},
                        smooth: true
                    }
                ]
            });
        }

        // State Trends Area (Trends Tab)
        if (stateTrendsAreaRef.current && timeline.length > 0) {
            const chart = echarts.init(stateTrendsAreaRef.current);
            chartsRef.current.stateTrendsArea = chart;

            const hours = timeline.map(t => {
                const date = new Date(t.hour_bucket);
                return `${String(date.getHours()).padStart(2, '0')}:00`;
            });

            // Calcular porcentagens
            const criticalPct = timeline.map(t =>
                t.total_active_badges > 0 ? (t.badges_critical_state / t.total_active_badges * 100) : 0
            );
            const highPct = timeline.map(t =>
                t.total_active_badges > 0 ? (t.badges_high_risk_state / t.total_active_badges * 100) : 0
            );
            const mediumPct = timeline.map(t =>
                t.total_active_badges > 0 ? (t.badges_medium_risk_state / t.total_active_badges * 100) : 0
            );
            const lowPct = timeline.map(t =>
                t.total_active_badges > 0 ? (t.badges_low_risk_state / t.total_active_badges * 100) : 0
            );

            chart.setOption({
                backgroundColor: 'transparent',
                tooltip: {
                    trigger: 'axis',
                    backgroundColor: 'rgba(15, 23, 42, 0.98)',
                    borderColor: '#475569',
                    textStyle: { color: '#e2e8f0' }
                },
                legend: {
                    data: ['Critical States', 'High Risk', 'Medium Risk', 'Low Risk'],
                    textStyle: { color: '#94a3b8' },
                    top: '5%'
                },
                grid: { left: '3%', right: '4%', bottom: '5%', top: '15%', containLabel: true },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: hours,
                    axisLabel: { color: '#94a3b8', interval: 5, rotate: 45 },
                    axisLine: { lineStyle: { color: '#475569' } }
                },
                yAxis: {
                    type: 'value',
                    name: '% of Badges',
                    nameTextStyle: { color: '#94a3b8' },
                    axisLabel: { color: '#94a3b8', formatter: '{value}%' },
                    splitLine: { lineStyle: { color: '#334155' } }
                },
                series: [
                    {
                        name: 'Critical States',
                        type: 'line',
                        smooth: true,
                        data: criticalPct,
                        itemStyle: { color: '#dc2626' },
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: 'rgba(220, 38, 38, 0.4)' },
                                { offset: 1, color: 'rgba(220, 38, 38, 0)' }
                            ])
                        }
                    },
                    {
                        name: 'High Risk',
                        type: 'line',
                        smooth: true,
                        data: highPct,
                        itemStyle: { color: '#f59e0b' },
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: 'rgba(245, 158, 11, 0.3)' },
                                { offset: 1, color: 'rgba(245, 158, 11, 0)' }
                            ])
                        }
                    },
                    {
                        name: 'Medium Risk',
                        type: 'line',
                        smooth: true,
                        data: mediumPct,
                        itemStyle: { color: '#3b82f6' },
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: 'rgba(59, 130, 246, 0.2)' },
                                { offset: 1, color: 'rgba(59, 130, 246, 0)' }
                            ])
                        }
                    },
                    {
                        name: 'Low Risk',
                        type: 'line',
                        smooth: true,
                        data: lowPct,
                        itemStyle: { color: '#10b981' },
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: 'rgba(16, 185, 129, 0.2)' },
                                { offset: 1, color: 'rgba(16, 185, 129, 0)' }
                            ])
                        }
                    }
                ]
            });
        }

        // State Risk Pie (Trends Tab)
        if (stateRiskPieRef.current && stateDistribution.length > 0) {
            const chart = echarts.init(stateRiskPieRef.current);
            chartsRef.current.stateRiskPie = chart;

            // Agrupar por nível de risco
            const riskLevels = {
                CRITICAL: 0,
                HIGH: 0,
                MEDIUM: 0,
                LOW: 0
            };

            stateDistribution.forEach(item => {
                if (['DAMAGE', 'NO_POWER', 'FAILURE'].includes(item.state_name)) {
                    riskLevels.CRITICAL += item.badge_count;
                } else if (['ABNORMAL'].includes(item.state_name)) {
                    riskLevels.HIGH += item.badge_count;
                } else if (['EMPTY', 'LEAVING'].includes(item.state_name)) {
                    riskLevels.MEDIUM += item.badge_count;
                } else {
                    riskLevels.LOW += item.badge_count;
                }
            });

            chart.setOption({
                backgroundColor: 'transparent',
                tooltip: {
                    trigger: 'item',
                    backgroundColor: 'rgba(15, 23, 42, 0.98)',
                    borderColor: '#475569',
                    textStyle: { color: '#e2e8f0' }
                },
                legend: { bottom: '5%', textStyle: { color: '#94a3b8' } },
                series: [{
                    type: 'pie',
                    radius: ['45%', '75%'],
                    data: [
                        { value: riskLevels.CRITICAL, name: 'CRITICAL', itemStyle: { color: '#dc2626' } },
                        { value: riskLevels.HIGH, name: 'HIGH', itemStyle: { color: '#f59e0b' } },
                        { value: riskLevels.MEDIUM, name: 'MEDIUM', itemStyle: { color: '#3b82f6' } },
                        { value: riskLevels.LOW, name: 'LOW', itemStyle: { color: '#10b981' } }
                    ],
                    label: {
                        color: '#e2e8f0',
                        formatter: '{b}\n{c} badges\n({d}%)',
                        fontSize: 12
                    },
                    itemStyle: { borderRadius: 8, borderColor: '#0f172a', borderWidth: 2 },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 15,
                            shadowColor: 'rgba(0, 0, 0, 0.7)'
                        }
                    }
                }]
            });
        }

        // GPS Map
        if (gpsMapRef.current && locations.length > 0) {
            const chart = echarts.init(gpsMapRef.current);
            chartsRef.current.gpsMap = chart;

            const mapData = locations.map(loc => [
                loc.longitude,
                loc.latitude,
                loc.badge_number,
                loc.risk_level,
                loc.risk_score,
                loc.risk_level === 'CRITICAL' ? '#dc2626' :
                    loc.risk_level === 'HIGH' ? '#f59e0b' :
                        loc.risk_level === 'MEDIUM' ? '#3b82f6' : '#10b981'
            ]);

            chart.setOption({
                backgroundColor: 'transparent',
                tooltip: {
                    trigger: 'item',
                    backgroundColor: 'rgba(15, 23, 42, 0.98)',
                    borderColor: '#475569',
                    textStyle: { color: '#e2e8f0' },
                    formatter: (params: any) => {
                        return `<strong>${params.data[2]}</strong><br/>
                                Risk: ${params.data[3]}<br/>
                                Score: ${params.data[4]}<br/>
                                Lat: ${params.data[1].toFixed(4)}<br/>
                                Lon: ${params.data[0].toFixed(4)}`;
                    }
                },
                grid: { left: '5%', right: '5%', bottom: '5%', top: '5%', containLabel: true },
                xAxis: {
                    type: 'value',
                    name: 'Longitude',
                    nameLocation: 'middle',
                    nameGap: 30,
                    nameTextStyle: { color: '#94a3b8', fontSize: 12 },
                    axisLabel: { color: '#94a3b8', fontSize: 10 },
                    splitLine: { lineStyle: { color: '#334155' } },
                    axisLine: { lineStyle: { color: '#475569' } }
                },
                yAxis: {
                    type: 'value',
                    name: 'Latitude',
                    nameLocation: 'middle',
                    nameGap: 40,
                    nameTextStyle: { color: '#94a3b8', fontSize: 12 },
                    axisLabel: { color: '#94a3b8', fontSize: 10 },
                    splitLine: { lineStyle: { color: '#334155' } },
                    axisLine: { lineStyle: { color: '#475569' } }
                },
                series: [{
                    type: 'scatter',
                    symbolSize: function (val: any) {
                        return Math.min(val[4] / 1.5, 50);
                    },
                    data: mapData,
                    itemStyle: {
                        color: function (params: any) {
                            return params.data[5];
                        },
                        shadowBlur: 10,
                        shadowColor: function (params: any) {
                            return params.data[5];
                        }
                    },
                    label: {
                        show: true,
                        formatter: '{@[2]}',
                        position: 'top',
                        color: '#e2e8f0',
                        fontSize: 10,
                        fontWeight: 'bold'
                    }
                }]
            });
        }

        // G-Force Heatmap (Motion Tab) - Mock data
        if (gforceHeatmapRef.current && activeTab === 'motion') {
            const chart = echarts.init(gforceHeatmapRef.current);
            chartsRef.current.gforceHeatmap = chart;

            const badges = ['BD-4523', 'BD-3891', 'BD-7234', 'BD-2156', 'BD-9012', 'BD-5678'];
            const hours = Array.from({ length: 24 }, (_, i) => i);
            const heatmapData: number[][] = [];
            for (let i = 0; i < 6; i++) {
                for (let j = 0; j < 24; j++) {
                    heatmapData.push([j, i, parseFloat((Math.random() * 3.5).toFixed(2))]);
                }
            }

            chart.setOption({
                backgroundColor: 'transparent',
                tooltip: {
                    position: 'top',
                    backgroundColor: 'rgba(15, 23, 42, 0.98)',
                    borderColor: '#475569',
                    textStyle: { color: '#e2e8f0' },
                    formatter: (params: any) => `${badges[params.data[1]]}<br/>${params.data[0]}:00 - ${params.data[2]}g`
                },
                grid: { height: '65%', top: '12%', left: '10%' },
                xAxis: {
                    type: 'category',
                    data: hours.map(h => `${String(h).padStart(2, '0')}:00`),
                    axisLabel: { color: '#94a3b8', interval: 2, fontSize: 11 },
                    splitArea: { show: true, areaStyle: { color: ['#1e293b', '#0f172a'] } },
                    axisLine: { lineStyle: { color: '#475569' } }
                },
                yAxis: {
                    type: 'category',
                    data: badges,
                    axisLabel: { color: '#94a3b8', fontSize: 11 },
                    splitArea: { show: true, areaStyle: { color: ['#1e293b', '#0f172a'] } },
                    axisLine: { lineStyle: { color: '#475569' } }
                },
                visualMap: {
                    min: 0,
                    max: 3.5,
                    calculable: true,
                    orient: 'horizontal',
                    left: 'center',
                    bottom: '5%',
                    textStyle: { color: '#94a3b8' },
                    inRange: { color: ['#1e40af', '#f59e0b', '#dc2626'] }
                },
                series: [{
                    type: 'heatmap',
                    data: heatmapData,
                    label: {
                        show: true,
                        color: '#fff',
                        fontSize: 10,
                        formatter: (params: any) => params.value[2]
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }]
            });
        }

        // Handle window resize
        const handleResize = () => {
            Object.values(chartsRef.current).forEach(chart => chart?.resize());
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            Object.values(chartsRef.current).forEach(chart => chart?.dispose());
        };
    }, [kpis, timeline, stateDistribution, locations, batteryDistribution, motionTimeline, impactDistribution, loading, activeTab]);

    // Resize charts when tab changes
    useEffect(() => {
        setTimeout(() => {
            Object.values(chartsRef.current).forEach(chart => chart?.resize());
        }, 100);
    }, [activeTab]);

    // ✅ COMPONENTE DE LOADING PARA GRÁFICOS
    const ChartLoader = () => (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-500 text-sm font-medium">Loading data...</p>
        </div>
    );

    // ✅ COMPONENTE DE LOADING PARA TABELAS
    const TableLoader = () => (
        <div className="w-full h-64 flex flex-col items-center justify-center">
            <div className="relative">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
            <p className="mt-3 text-gray-500 text-sm">Loading events...</p>
        </div>
    );

    // Loading state
    if (loading && !kpis) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mb-4"></div>
                    <p className="text-slate-300 text-lg">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a0f1e] to-[#1a1f2e] flex items-center justify-center">
                <div className="bg-red-900/20 border border-red-500 rounded-xl p-8 max-w-md">
                    <h2 className="text-red-400 text-xl font-bold mb-2">Error Loading Dashboard</h2>
                    <p className="text-slate-300">{error}</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="bg-red-50 border-2 border-red-500 rounded-xl p-8 max-w-md">
                    <h2 className="text-red-700 text-xl font-bold mb-2">Error Loading Dashboard</h2>
                    <p className="text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-gray-900 p-5">
            {/* Header */}
            <div className="relative bg-white border-2 border-orange-500 rounded-2xl p-7 mb-6 shadow-xl overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 animate-[shimmer_3s_linear_infinite]"></div>
                <h1 className="text-orange-500 text-4xl font-extrabold mb-2 flex items-center gap-3 tracking-tight">
                    <ShieldCheckIcon className="w-10 h-10" />
                    Risk Events Monitoring Center
                </h1>
                <div className="text-gray-700 text-sm flex items-center gap-5 flex-wrap">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/15 border border-emerald-500 rounded-full text-xs font-semibold uppercase tracking-wide">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse"></span>
                        SYSTEM ACTIVE
                    </span>
                    <span>Motion & State Detection Enabled</span>
                    <span>•</span>
                    <span>SmartX HUB v2.0</span>
                    <span>•</span>
                    <span>Last update: <span className="font-mono">{lastUpdate}</span></span>
                </div>
            </div>

            {/* KPI Grid */}
            {kpis && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="group relative bg-emerald-50/40 backdrop-blur-md border-2 border-emerald-200/50 rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-emerald-500 cursor-pointer overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-emerald-500 transition-all duration-300 group-hover:h-[5px]"></div>
                        <div className="text-emerald-700 text-[11px] uppercase tracking-widest mb-2.5 font-bold flex items-center gap-1.5">
                            <RocketLaunchIcon className="w-4 h-4" />

                            ACTIVE BADGES
                        </div>
                        <div className="text-5xl font-black leading-none mb-2 text-emerald-600 tabular-nums drop-shadow-sm">
                            {kpis.total_active_badges}
                        </div>
                        <div className="text-[11px] text-emerald-500 flex items-center gap-1.5 font-medium">
                            <SignalIcon className="w-3 h-3" />
                            Online monitoring
                        </div>
                    </div>

                    <div className="group relative bg-red-50/40 backdrop-blur-md border-2 border-red-200/50 rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-red-600 cursor-pointer overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-red-600 transition-all duration-300 group-hover:h-[5px]"></div>
                        <div className="text-red-700 text-[11px] uppercase tracking-widest mb-2.5 font-bold flex items-center gap-1.5">
                            <ExclamationTriangleIcon className="w-4 h-4" />
                            CRITICAL ALERTS
                        </div>
                        <div className="text-5xl font-black leading-none mb-2 text-red-600 tabular-nums drop-shadow-sm">
                            {kpis.critical_badges}
                        </div>
                        <div className="text-[11px] text-red-500 flex items-center gap-1.5 font-medium">
                            <ArrowUpCircleIcon className="w-3 h-3" />
                            Man Down + SOS ({kpis.mandown_count + kpis.sos_count})
                        </div>
                    </div>

                    <div className="group relative bg-amber-50/40 backdrop-blur-md border-2 border-amber-200/50 rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-amber-500 cursor-pointer overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-amber-500 transition-all duration-300 group-hover:h-[5px]"></div>
                        <div className="text-amber-700 text-[11px] uppercase tracking-widest mb-2.5 font-bold flex items-center gap-1.5">
                            <BellAlertIcon className="w-4 h-4" />
                            ACTIVE ALARMS
                        </div>
                        <div className="text-5xl font-black leading-none mb-2 text-amber-600 tabular-nums drop-shadow-sm">
                            {kpis.alarm_count}
                        </div>
                        <div className="text-[11px] text-amber-500 flex items-center gap-1.5 font-medium">
                            Alarm 1 & 2
                        </div>
                    </div>

                    <div className="group relative bg-violet-50/40 backdrop-blur-md border-2 border-violet-200/50 rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-violet-500 cursor-pointer overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-violet-500 transition-all duration-300 group-hover:h-[5px]"></div>
                        <div className="text-violet-700 text-[11px] uppercase tracking-widest mb-2.5 font-bold flex items-center gap-1.5">
                            <ArrowsRightLeftIcon className="w-4 h-4" />
                            MOTION EVENTS
                        </div>
                        <div className="text-5xl font-black leading-none mb-2 text-violet-600 tabular-nums drop-shadow-sm">
                            {kpis.high_impact_count}
                        </div>
                        <div className="text-[11px] text-violet-500 flex items-center gap-1.5 font-medium">
                            High impact detected
                        </div>
                    </div>

                    <div className="group relative bg-amber-50/40 backdrop-blur-md border-2 border-amber-200/50 rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-amber-500 cursor-pointer overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-amber-500 transition-all duration-300 group-hover:h-[5px]"></div>
                        <div className="text-amber-700 text-[11px] uppercase tracking-widest mb-2.5 font-bold flex items-center gap-1.5">
                            <PauseCircleIcon className="w-4 h-4" />
                            IMMOBILE BADGES
                        </div>
                        <div className="text-5xl font-black leading-none mb-2 text-amber-600 tabular-nums drop-shadow-sm">
                            {kpis.immobile_badge_count}
                        </div>
                        <div className="text-[11px] text-amber-500 flex items-center gap-1.5 font-medium">
                            &gt; 10 min no motion
                        </div>
                    </div>

                    <div className="group relative bg-pink-50/40 backdrop-blur-md border-2 border-pink-200/50 rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-pink-500 cursor-pointer overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-pink-500 transition-all duration-300 group-hover:h-[5px]"></div>
                        <div className="text-pink-700 text-[11px] uppercase tracking-widest mb-2.5 font-bold flex items-center gap-1.5">
                            <Cog6ToothIcon className="w-4 h-4" />
                            CRITICAL STATES
                        </div>
                        <div className="text-5xl font-black leading-none mb-2 text-pink-600 tabular-nums drop-shadow-sm">
                            {kpis.critical_state_count}
                        </div>
                        <div className="text-[11px] text-pink-500 flex items-center gap-1.5 font-medium">
                            <ArrowUpCircleIcon className="w-3 h-3" />
                            Damage/Failure
                        </div>
                    </div>

                    <div className="group relative bg-blue-50/40 backdrop-blur-md border-2 border-blue-200/50 rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-blue-500 cursor-pointer overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-blue-500 transition-all duration-300 group-hover:h-[5px]"></div>
                        <div className="text-blue-700 text-[11px] uppercase tracking-widest mb-2.5 font-bold flex items-center gap-1.5">
                            <ChartBarIcon className="w-4 h-4" />
                            AVG RISK SCORE
                        </div>
                        <div className="text-5xl font-black leading-none mb-2 text-blue-600 tabular-nums drop-shadow-sm">
                            {kpis.avg_risk_score}
                        </div>
                        <div className="text-[11px] text-blue-500 flex items-center gap-1.5 font-medium">
                            Out of 100
                        </div>
                    </div>

                    <div className="group relative bg-blue-50/40 backdrop-blur-md border-2 border-blue-200/50 rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-blue-500 cursor-pointer overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-blue-500 transition-all duration-300 group-hover:h-[5px]"></div>
                        <div className="text-blue-700 text-[11px] uppercase tracking-widest mb-2.5 font-bold flex items-center gap-1.5">
                            <Battery100Icon className="w-4 h-4" />
                            AVG BATTERY
                        </div>
                        <div className="text-5xl font-black leading-none mb-2 text-blue-600 tabular-nums drop-shadow-sm">
                            {kpis.avg_battery_percent}%
                        </div>
                        <div className="text-[11px] text-blue-500 flex items-center gap-1.5 font-medium">
                            <ArrowDownCircleIcon className="w-3 h-3" />
                            Fleet average
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-white border-2 border-gray-200 p-2 rounded-xl flex-wrap">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-6 py-3 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${activeTab === 'overview'
                        ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:-translate-y-0.5'
                        }`}
                >
                    <ChartBarIcon className="w-5 h-5" />
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('motion')}
                    className={`px-6 py-3 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${activeTab === 'motion'
                        ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:-translate-y-0.5'
                        }`}
                >
                    <BoltIcon className="w-5 h-5" />
                    Motion & Impact
                </button>
                <button
                    onClick={() => setActiveTab('state')}
                    className={`px-6 py-3 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${activeTab === 'state'
                        ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:-translate-y-0.5'
                        }`}
                >
                    <CogIcon className="w-5 h-5" />
                    State Monitoring
                </button>
                <button
                    onClick={() => setActiveTab('trends')}
                    className={`px-6 py-3 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${activeTab === 'trends'
                        ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:-translate-y-0.5'
                        }`}
                >
                    <ArrowTrendingUpIcon className="w-5 h-5" />
                    Risk Trends
                </button>
                <button
                    onClick={() => setActiveTab('events')}
                    className={`px-6 py-3 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${activeTab === 'events'
                        ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:-translate-y-0.5'
                        }`}
                >
                    <DocumentTextIcon className="w-5 h-5" />
                    Event Log
                </button>
                <button
                    onClick={() => setActiveTab('map')}
                    className={`px-6 py-3 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${activeTab === 'map'
                        ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:-translate-y-0.5'
                        }`}
                >
                    <MapPinIcon className="w-5 h-5" />
                    GPS Map
                </button>
            </div>

            {/* Overview Tab */}
            {/* {activeTab === 'overview' && (
                <div className="grid grid-cols-12 gap-5">
                    <div className="col-span-12 lg:col-span-8 bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg transition-all duration-300 hover:border-gray-300 hover:shadow-xl">
                        <h2 className="text-gray-900 text-lg font-bold mb-5 pb-3 border-b-2 border-gray-200 flex items-center gap-2.5">
                            📈 48-Hour Risk Timeline
                        </h2>
                        <div ref={riskTimelineRef} className="w-full h-[450px]"></div>
                    </div>

                    <div className="col-span-12 lg:col-span-4 bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg transition-all duration-300 hover:border-gray-300 hover:shadow-xl">
                        <h2 className="text-gray-900 text-lg font-bold mb-5 pb-3 border-b-2 border-gray-200 flex items-center gap-2.5">
                            🎯 State Distribution
                        </h2>
                        <div ref={eventTypePieRef} className="w-full h-[450px]"></div>
                    </div>

                    <div className="col-span-12 lg:col-span-6 bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg transition-all duration-300 hover:border-gray-300 hover:shadow-xl">
                        <h2 className="text-gray-900 text-lg font-bold mb-5 pb-3 border-b-2 border-gray-200 flex items-center gap-2.5">
                            🌡️ Temperature Risk Gauge
                        </h2>
                        <div ref={tempRiskRef} className="w-full h-[380px]"></div>
                    </div>

                    <div className="col-span-12 lg:col-span-6 bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg transition-all duration-300 hover:border-gray-300 hover:shadow-xl">
                        <h2 className="text-gray-900 text-lg font-bold mb-5 pb-3 border-b-2 border-gray-200 flex items-center gap-2.5">
                            🔋 Battery Status Distribution
                        </h2>
                        <div ref={batteryStatusRef} className="w-full h-[380px]"></div>
                    </div>
                </div>
            )} */}

            {activeTab === 'overview' && (
                <div className="grid grid-cols-12 gap-5">
                    <div className="col-span-12 lg:col-span-8 bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg transition-all duration-300 hover:border-gray-300 hover:shadow-xl">
                        <h2 className="text-gray-900 text-lg font-bold mb-5 pb-3 border-b-2 border-gray-200 flex items-center gap-2.5">
                            📈 48-Hour Risk Timeline
                        </h2>
                        <div className="w-full h-[450px]">
                            {timeline.length === 0 ? (
                                <ChartLoader />
                            ) : (
                                <div ref={riskTimelineRef} className="w-full h-full"></div>
                            )}
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-4 bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg transition-all duration-300 hover:border-gray-300 hover:shadow-xl">
                        <h2 className="text-gray-900 text-lg font-bold mb-5 pb-3 border-b-2 border-gray-200 flex items-center gap-2.5">
                            🎯 State Distribution
                        </h2>
                        <div className="w-full h-[450px]">
                            {stateDistribution.length === 0 ? (
                                <ChartLoader />
                            ) : (
                                <div ref={eventTypePieRef} className="w-full h-full"></div>
                            )}
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-6 bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg transition-all duration-300 hover:border-gray-300 hover:shadow-xl">
                        <h2 className="text-gray-900 text-lg font-bold mb-5 pb-3 border-b-2 border-gray-200 flex items-center gap-2.5">
                            🌡️ Temperature Risk Gauge
                        </h2>
                        <div className="w-full h-[380px]">
                            {!kpis ? (
                                <ChartLoader />
                            ) : (
                                <div ref={tempRiskRef} className="w-full h-full"></div>
                            )}
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-6 bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg transition-all duration-300 hover:border-gray-300 hover:shadow-xl">
                        <h2 className="text-gray-900 text-lg font-bold mb-5 pb-3 border-b-2 border-gray-200 flex items-center gap-2.5">
                            🔋 Battery Status Distribution
                        </h2>
                        <div className="w-full h-[380px]">
                            {batteryDistribution.length === 0 ? (
                                <ChartLoader />
                            ) : (
                                <div ref={batteryStatusRef} className="w-full h-full"></div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Motion Tab */}
            {/* {activeTab === 'motion' && (
                <div className="grid grid-cols-12 gap-5">
                    <div className="col-span-12 lg:col-span-8 bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg transition-all duration-300 hover:border-gray-300 hover:shadow-xl">
                        <h2 className="text-gray-900 text-lg font-bold mb-5 pb-3 border-b-2 border-gray-200 flex items-center gap-2.5">
                            💥 G-Force Impact Timeline (24h)
                        </h2>
                        <div ref={gforceTimelineRef} className="w-full h-[450px]"></div>
                    </div>

                    <div className="col-span-12 lg:col-span-4 bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg transition-all duration-300 hover:border-gray-300 hover:shadow-xl">
                        <h2 className="text-gray-900 text-lg font-bold mb-5 pb-3 border-b-2 border-gray-200 flex items-center gap-2.5">
                            📊 Impact Severity Distribution
                        </h2>
                        <div ref={impactDistRef} className="w-full h-[450px]"></div>
                    </div>

                    <div className="col-span-12 bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg transition-all duration-300 hover:border-gray-300 hover:shadow-xl">
                        <h2 className="text-gray-900 text-lg font-bold mb-5 pb-3 border-b-2 border-gray-200 flex items-center gap-2.5">
                            🔥 G-Force Heatmap (Badge × Hour)
                        </h2>
                        <div ref={gforceHeatmapRef} className="w-full h-[380px]"></div>
                    </div>
                </div>
            )} */}


            {/* Motion Tab */}
            {activeTab === 'motion' && (
                <div className="grid grid-cols-12 gap-5">
                    <div className="col-span-12 lg:col-span-8 bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg transition-all duration-300 hover:border-gray-300 hover:shadow-xl">
                        <h2 className="text-gray-900 text-lg font-bold mb-5 pb-3 border-b-2 border-gray-200 flex items-center gap-2.5">
                            💥 G-Force Impact Timeline (24h)
                        </h2>
                        <div className="w-full h-[450px]">
                            {motionTimeline.length === 0 ? (
                                <ChartLoader />
                            ) : (
                                <div ref={gforceTimelineRef} className="w-full h-full"></div>
                            )}
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-4 bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg transition-all duration-300 hover:border-gray-300 hover:shadow-xl">
                        <h2 className="text-gray-900 text-lg font-bold mb-5 pb-3 border-b-2 border-gray-200 flex items-center gap-2.5">
                            📊 Impact Severity Distribution
                        </h2>
                        <div className="w-full h-[450px]">
                            {impactDistribution.length === 0 ? (
                                <ChartLoader />
                            ) : (
                                <div ref={impactDistRef} className="w-full h-full"></div>
                            )}
                        </div>
                    </div>

                    <div className="col-span-12 bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg transition-all duration-300 hover:border-gray-300 hover:shadow-xl">
                        <h2 className="text-gray-900 text-lg font-bold mb-5 pb-3 border-b-2 border-gray-200 flex items-center gap-2.5">
                            🔥 G-Force Heatmap (Badge × Hour)
                        </h2>
                        <div className="w-full h-[380px]">
                            {activeTab !== 'motion' ? (
                                <ChartLoader />
                            ) : (
                                <div ref={gforceHeatmapRef} className="w-full h-full"></div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* State Tab */}
            {/* {activeTab === 'state' && (
                <div className="grid grid-cols-12 gap-5">
                    <div className="col-span-12 lg:col-span-6 bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg transition-all duration-300 hover:border-gray-300 hover:shadow-xl">
                        <h2 className="text-gray-900 text-lg font-bold mb-5 pb-3 border-b-2 border-gray-200 flex items-center gap-2.5">
                            ⚙️ Sensor State Distribution
                        </h2>
                        <div ref={stateDistributionRef} className="w-full h-[380px]"></div>
                    </div>

                    <div className="col-span-12 lg:col-span-6 bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg transition-all duration-300 hover:border-gray-300 hover:shadow-xl">
                        <h2 className="text-gray-900 text-lg font-bold mb-5 pb-3 border-b-2 border-gray-200 flex items-center gap-2.5">
                            🔄 State Changes Timeline (48h)
                        </h2>
                        <div ref={stateChangesRef} className="w-full h-[380px]"></div>
                    </div>

                    <div className="col-span-12 bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg transition-all duration-300 hover:border-gray-300 hover:shadow-xl">
                        <h2 className="text-gray-900 text-lg font-bold mb-5 pb-3 border-b-2 border-gray-200 flex items-center gap-2.5">
                            ⏱️ Immobility Alerts (&gt;10 minutes)
                        </h2>
                        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                            <table className="w-full border-separate border-spacing-0">
                                <thead className="sticky top-0 bg-gray-50 z-10">
                                    <tr>
                                        <th className="text-left p-3 text-[11px] font-bold uppercase tracking-wide text-gray-600 border-b-2 border-gray-200">Badge</th>
                                        <th className="text-left p-3 text-[11px] font-bold uppercase tracking-wide text-gray-600 border-b-2 border-gray-200">Duration</th>
                                        <th className="text-left p-3 text-[11px] font-bold uppercase tracking-wide text-gray-600 border-b-2 border-gray-200">Severity</th>
                                        <th className="text-left p-3 text-[11px] font-bold uppercase tracking-wide text-gray-600 border-b-2 border-gray-200">Last Location</th>
                                        <th className="text-left p-3 text-[11px] font-bold uppercase tracking-wide text-gray-600 border-b-2 border-gray-200">Last G-Force</th>
                                        <th className="text-left p-3 text-[11px] font-bold uppercase tracking-wide text-gray-600 border-b-2 border-gray-200">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {immobilityAlerts.map((item, idx) => (
                                        <tr key={idx} className="transition-all duration-200 hover:bg-gray-50">
                                            <td className="p-3 text-sm text-gray-700 border-b border-gray-200">
                                                <span className="inline-flex items-center bg-gray-100 text-gray-800 px-3 py-1 rounded-md text-xs font-black font-mono tracking-wide">{item.badge_number}</span>
                                            </td>
                                            <td className="p-3 text-sm text-gray-700 border-b border-gray-200">
                                                <strong>{item.duration_minutes} min</strong>
                                            </td>
                                            <td className="p-3 text-sm text-gray-700 border-b border-gray-200">
                                                <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                                                    item.severity === 'CRITICAL' ? 'bg-red-100 text-red-700 border border-red-300' :
                                                    item.severity === 'HIGH' ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                                                    'bg-blue-100 text-blue-700 border border-blue-300'
                                                }`}>
                                                    {item.severity}
                                                </span>
                                            </td>
                                            <td className="p-3 text-sm text-gray-700 border-b border-gray-200">
                                                📍 {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                                            </td>
                                            <td className="p-3 text-sm text-gray-700 border-b border-gray-200">💥 {item.last_gforce}g</td>
                                            <td className="p-3 text-sm text-gray-700 border-b border-gray-200">
                                                <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-amber-100 text-amber-700 border border-amber-300">IMMOBILE</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )} */}

            {/* State Tab */}
            {activeTab === 'state' && (
                <div className="grid grid-cols-12 gap-5">
                    <div className="col-span-12 lg:col-span-6 bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg transition-all duration-300 hover:border-gray-300 hover:shadow-xl">
                        <h2 className="text-gray-900 text-lg font-bold mb-5 pb-3 border-b-2 border-gray-200 flex items-center gap-2.5">
                            ⚙️ Sensor State Distribution
                        </h2>
                        <div className="w-full h-[380px]">
                            {stateDistribution.length === 0 ? (
                                <ChartLoader />
                            ) : (
                                <div ref={stateDistributionRef} className="w-full h-full"></div>
                            )}
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-6 bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg transition-all duration-300 hover:border-gray-300 hover:shadow-xl">
                        <h2 className="text-gray-900 text-lg font-bold mb-5 pb-3 border-b-2 border-gray-200 flex items-center gap-2.5">
                            🔄 State Changes Timeline (48h)
                        </h2>
                        <div className="w-full h-[380px]">
                            {timeline.length === 0 ? (
                                <ChartLoader />
                            ) : (
                                <div ref={stateChangesRef} className="w-full h-full"></div>
                            )}
                        </div>
                    </div>

                    <div className="col-span-12 bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg transition-all duration-300 hover:border-gray-300 hover:shadow-xl">
                        <h2 className="text-gray-900 text-lg font-bold mb-5 pb-3 border-b-2 border-gray-200 flex items-center gap-2.5">
                            ⏱️ Immobility Alerts (&gt;10 minutes)
                        </h2>
                        {immobilityAlerts.length === 0 ? (
                            <TableLoader />
                        ) : (
                            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                                <table className="w-full border-separate border-spacing-0">
                                    {/* ... (manter estrutura da tabela) ... */}
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}


            {/* Trends Tab */}
            {/* {activeTab === 'trends' && (
                <div className="grid grid-cols-12 gap-5">
                    <div className="col-span-12 lg:col-span-8 bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg transition-all duration-300 hover:border-gray-300 hover:shadow-xl">
                        <h2 className="text-gray-900 text-lg font-bold mb-5 pb-3 border-b-2 border-gray-200 flex items-center gap-2.5">
                            📊 State Risk Distribution Trends
                        </h2>
                        <div ref={stateTrendsAreaRef} className="w-full h-[450px]"></div>
                    </div>

                    <div className="col-span-12 lg:col-span-4 bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg transition-all duration-300 hover:border-gray-300 hover:shadow-xl">
                        <h2 className="text-gray-900 text-lg font-bold mb-5 pb-3 border-b-2 border-gray-200 flex items-center gap-2.5">
                            🎯 Current State Risk Levels
                        </h2>
                        <div ref={stateRiskPieRef} className="w-full h-[450px]"></div>
                    </div>

                    <div className="col-span-12 bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg transition-all duration-300 hover:border-gray-300 hover:shadow-xl">
                        <h2 className="text-gray-900 text-lg font-bold mb-5 pb-3 border-b-2 border-gray-200 flex items-center gap-2.5">
                            📈 Predictive Risk Score Rankings (Top 20)
                        </h2>
                        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                            <table className="w-full border-separate border-spacing-0">
                                <thead className="sticky top-0 bg-gray-50 z-10">
                                    <tr>
                                        <th className="text-left p-3 text-[11px] font-bold uppercase tracking-wide text-gray-600 border-b-2 border-gray-200">Rank</th>
                                        <th className="text-left p-3 text-[11px] font-bold uppercase tracking-wide text-gray-600 border-b-2 border-gray-200">Badge</th>
                                        <th className="text-left p-3 text-[11px] font-bold uppercase tracking-wide text-gray-600 border-b-2 border-gray-200">State</th>
                                        <th className="text-left p-3 text-[11px] font-bold uppercase tracking-wide text-gray-600 border-b-2 border-gray-200">Risk Score</th>
                                        <th className="text-left p-3 text-[11px] font-bold uppercase tracking-wide text-gray-600 border-b-2 border-gray-200">24h Critical Events</th>
                                        <th className="text-left p-3 text-[11px] font-bold uppercase tracking-wide text-gray-600 border-b-2 border-gray-200">7d History</th>
                                        <th className="text-left p-3 text-[11px] font-bold uppercase tracking-wide text-gray-600 border-b-2 border-gray-200">Recommendation</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ranking.map((item, idx) => (
                                        <tr key={idx} className="transition-all duration-200 hover:bg-gray-50">
                                            <td className="p-3 text-sm text-gray-700 border-b border-gray-200">
                                                <strong>#{idx + 1}</strong>
                                            </td>
                                            <td className="p-3 text-sm text-gray-700 border-b border-gray-200">
                                                <span className="inline-flex items-center bg-gray-100 text-gray-800 px-3 py-1 rounded-md text-xs font-black font-mono tracking-wide">{item.badge_number}</span>
                                            </td>
                                            <td className="p-3 text-sm text-gray-700 border-b border-gray-200">
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase ${
                                                    ['DAMAGE', 'NO_POWER', 'FAILURE'].includes(item.current_state_name) ? 'bg-red-100 text-red-700 border border-red-300' :
                                                    item.current_state_name === 'ABNORMAL' ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                                                    'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                                }`}>
                                                    {item.current_state_name}
                                                </span>
                                            </td>
                                            <td className="p-3 text-sm text-gray-700 border-b border-gray-200">
                                                <strong style={{ color: item.predictive_risk_score >= 70 ? '#dc2626' : item.predictive_risk_score >= 50 ? '#f59e0b' : '#3b82f6' }}>
                                                    {item.predictive_risk_score}
                                                </strong>
                                            </td>
                                            <td className="p-3 text-sm text-gray-700 border-b border-gray-200">{item.critical_state_count_24h}</td>
                                            <td className="p-3 text-[11px] text-gray-700 border-b border-gray-200">
                                                MAN_DOWN×{item.emergency_history_7d}, ALARM×{item.alarm_history_7d}
                                            </td>
                                            <td className="p-3 text-[11px] text-gray-700 border-b border-gray-200">{item.risk_recommendation}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )} */}

            {/* Trends Tab */}
            {activeTab === 'trends' && (
                <div className="grid grid-cols-12 gap-5">
                    <div className="col-span-12 lg:col-span-8 bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg transition-all duration-300 hover:border-gray-300 hover:shadow-xl">
                        <h2 className="text-gray-900 text-lg font-bold mb-5 pb-3 border-b-2 border-gray-200 flex items-center gap-2.5">
                            📊 State Risk Distribution Trends
                        </h2>
                        <div className="w-full h-[450px]">
                            {timeline.length === 0 ? (
                                <ChartLoader />
                            ) : (
                                <div ref={stateTrendsAreaRef} className="w-full h-full"></div>
                            )}
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-4 bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg transition-all duration-300 hover:border-gray-300 hover:shadow-xl">
                        <h2 className="text-gray-900 text-lg font-bold mb-5 pb-3 border-b-2 border-gray-200 flex items-center gap-2.5">
                            🎯 Current State Risk Levels
                        </h2>
                        <div className="w-full h-[450px]">
                            {stateDistribution.length === 0 ? (
                                <ChartLoader />
                            ) : (
                                <div ref={stateRiskPieRef} className="w-full h-full"></div>
                            )}
                        </div>
                    </div>

                    <div className="col-span-12 bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg transition-all duration-300 hover:border-gray-300 hover:shadow-xl">
                        <h2 className="text-gray-900 text-lg font-bold mb-5 pb-3 border-b-2 border-gray-200 flex items-center gap-2.5">
                            📈 Predictive Risk Score Rankings (Top 20)
                        </h2>
                        {ranking.length === 0 ? (
                            <TableLoader />
                        ) : (
                            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                                <table className="w-full border-separate border-spacing-0">
                                    {/* ... (manter estrutura da tabela) ... */}
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Events Tab */}
            {/* {activeTab === 'events' && (
                <div className="grid grid-cols-12 gap-5">
                    <div className="col-span-12 bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg transition-all duration-300 hover:border-gray-300 hover:shadow-xl">
                        <h2 className="text-gray-900 text-lg font-bold mb-5 pb-3 border-b-2 border-gray-200 flex items-center gap-2.5">
                            📋 Comprehensive Event Log (Last 100 Events)
                        </h2>
                        <div className="max-h-[500px] overflow-y-auto pr-2">
                            {events.map((event, idx) => {
                                const timeAgo = new Date(event.degradation_time).toLocaleString();
                                const severity = event.event_severity.toLowerCase() as 'critical' | 'high' | 'medium' | 'low';
                                
                                return (
                                    <div
                                        key={idx}
                                        className={`bg-white border-2 rounded-lg p-4 mb-3 transition-all duration-200 cursor-pointer hover:border-gray-400 hover:shadow-md ${
                                            severity === 'critical' ? 'border-l-4 border-l-red-600 border-gray-200' :
                                            severity === 'high' ? 'border-l-4 border-l-amber-500 border-gray-200' :
                                            severity === 'medium' ? 'border-l-4 border-l-blue-500 border-gray-200' :
                                            'border-l-4 border-l-emerald-500 border-gray-200'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center mb-2.5">
                                            <span className="font-bold text-[15px] text-gray-900">
                                                ⚙️ {event.degradation_type} Degradation
                                            </span>
                                            <span className="text-xs text-gray-500 font-semibold">{timeAgo}</span>
                                        </div>
                                        <div className="text-[13px] text-gray-600 flex flex-wrap gap-2.5 items-center">
                                            <span className="inline-flex items-center bg-gray-100 text-gray-800 px-3 py-1 rounded-md text-xs font-black font-mono tracking-wide">
                                                {event.badge_number}
                                            </span>
                                            <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                                                severity === 'critical' ? 'bg-red-100 text-red-700 border border-red-300' :
                                                severity === 'high' ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                                                severity === 'medium' ? 'bg-blue-100 text-blue-700 border border-blue-300' :
                                                'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                            }`}>
                                                {event.event_severity}
                                            </span>
                                            <span>
                                                {event.previous_state} → {event.current_state} • 
                                                Score: {event.degradation_severity_score} • 
                                                {event.hours_in_previous_state}h in previous state
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )} */}

            {/* Events Tab */}
            {activeTab === 'events' && (
                <div className="grid grid-cols-12 gap-5">
                    <div className="col-span-12 bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg transition-all duration-300 hover:border-gray-300 hover:shadow-xl">
                        <h2 className="text-gray-900 text-lg font-bold mb-5 pb-3 border-b-2 border-gray-200 flex items-center gap-2.5">
                            📋 Comprehensive Event Log (Last 100 Events)
                        </h2>
                        {events.length === 0 ? (
                            <TableLoader />
                        ) : (
                            <div className="max-h-[500px] overflow-y-auto pr-2">
                                {events.map((event, idx) => {
                                    //@ts-ignore
                                    const timeAgo = new Date(event.degradation_time).toLocaleString();
                                    const severity = event.event_severity.toLowerCase() as 'critical' | 'high' | 'medium' | 'low';

                                    return (
                                        <div
                                        key={idx}
                                        className={`bg-white border-2 rounded-lg p-4 mb-3 transition-all duration-200 cursor-pointer hover:border-gray-400 hover:shadow-md ${
                                            severity === 'critical' ? 'border-l-4 border-l-red-600 border-gray-200' :
                                            severity === 'high' ? 'border-l-4 border-l-amber-500 border-gray-200' :
                                            severity === 'medium' ? 'border-l-4 border-l-blue-500 border-gray-200' :
                                            'border-l-4 border-l-emerald-500 border-gray-200'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center mb-2.5">
                                            <span className="font-bold text-[15px] text-gray-900">
                                                ⚙️ {event.degradation_type} Degradation
                                            </span>
                                            <span className="text-xs text-gray-500 font-semibold">{timeAgo}</span>
                                        </div>
                                        <div className="text-[13px] text-gray-600 flex flex-wrap gap-2.5 items-center">
                                            <span className="inline-flex items-center bg-gray-100 text-gray-800 px-3 py-1 rounded-md text-xs font-black font-mono tracking-wide">
                                                {event.badge_number}
                                            </span>
                                            <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                                                severity === 'critical' ? 'bg-red-100 text-red-700 border border-red-300' :
                                                severity === 'high' ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                                                severity === 'medium' ? 'bg-blue-100 text-blue-700 border border-blue-300' :
                                                'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                            }`}>
                                                {event.event_severity}
                                            </span>
                                            <span>
                                                {event.previous_state} → {event.current_state} • 
                                                Score: {event.degradation_severity_score} • 
                                                {event.hours_in_previous_state}h in previous state
                                            </span>
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Map Tab */}
            {/* {activeTab === 'map' && (
                <div className="grid grid-cols-12 gap-5">
                    <div className="col-span-12 bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg transition-all duration-300 hover:border-gray-300 hover:shadow-xl">
                        <h2 className="text-gray-900 text-lg font-bold mb-5 pb-3 border-b-2 border-gray-200 flex items-center gap-2.5">
                            📍 Real-Time GPS Badge Locations
                        </h2>
                        <div ref={gpsMapRef} className="w-full h-[600px]"></div>
                    </div>
                </div>
            )} */}

            {/* Map Tab */}
            {activeTab === 'map' && (
                <div className="grid grid-cols-12 gap-5">
                    <div className="col-span-12 bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg transition-all duration-300 hover:border-gray-300 hover:shadow-xl">
                        <h2 className="text-gray-900 text-lg font-bold mb-5 pb-3 border-b-2 border-gray-200 flex items-center gap-2.5">
                            📍 Real-Time GPS Badge Locations
                        </h2>
                        <div className="w-full h-[600px]">
                            {locations.length === 0 ? (
                                <ChartLoader />
                            ) : (
                                <div ref={gpsMapRef} className="w-full h-full"></div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}