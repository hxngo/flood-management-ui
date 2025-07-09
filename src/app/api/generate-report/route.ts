import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { planData, monitoringData, reportType } = await request.json();

    // OpenAI API 키 확인
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      // API 키가 없으면 기본 리포트 반환
      return NextResponse.json({
        report: generateDefaultReport(planData, monitoringData)
      });
    }

    // LLM 프롬프트 생성
    const prompt = `
You are an expert project analyst specializing in climate resilience and flood management projects. Please generate a comprehensive project report based on the following data:

=== PROJECT PLAN DATA ===
Project Information:
- Name: ${planData.projectInfo?.projectName}
- Number: ${planData.projectInfo?.projectNumber}
- Country: ${planData.projectInfo?.country}
- Status: ${planData.projectInfo?.projectStatus}
- Type: ${planData.projectInfo?.projectType}
- Funding: ${planData.projectInfo?.fundingSource}
- Sector: ${planData.projectInfo?.sector}
- Target Disaster: ${planData.projectInfo?.targetDisaster}
- Infrastructure: ${planData.projectInfo?.climateInfrastructure}
- Region: ${planData.projectInfo?.region}
- Agency: ${planData.projectInfo?.responsibleAgency}
- Description: ${planData.projectInfo?.description}

Climate Infrastructure Measures:
${planData.climateInfrastructure?.map((item, index) => `
${index + 1}. ${item.disaster}:
${item.measures.map(measure => `   - ${measure}`).join('\n')}
`).join('')}

=== MONITORING DATA ===
- Current Progress: ${monitoringData.projectProgress}%
- Selected Year: ${monitoringData.selectedYear}
- Suspicious Activity Detected: ${monitoringData.suspiciousLogDetected}

Activity Logs:
${monitoringData.projectLogs?.map(log => `
- ${log.title} (${log.id})
  Status: ${log.status}
  Date: ${log.timestamp}
  Description: ${log.description}
  Impact: ${log.impact}
`).join('')}

=== REPORT REQUIREMENTS ===
Generate a comprehensive project report in markdown format that includes:

1. **Executive Summary** - Key findings and current status
2. **Project Overview** - Basic project information and objectives
3. **Progress Analysis** - Current completion status and timeline assessment
4. **Infrastructure Assessment** - Analysis of climate resilience measures
5. **Monitoring Insights** - Analysis of activity logs and detected issues
6. **Risk Assessment** - Identification of potential risks and concerns
7. **Financial Analysis** - Budget and funding assessment
8. **Recommendations** - Actionable next steps and improvements
9. **Conclusion** - Overall project health and future outlook

The report should be professional, detailed, and provide actionable insights for project stakeholders. Focus on both achievements and areas requiring attention, especially the suspicious activity detected in monitoring.

Please write the report in clear, professional language suitable for project managers and stakeholders.
`;

    // OpenAI API 호출
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert project analyst and report writer specializing in climate resilience and infrastructure projects. Generate comprehensive, professional project reports based on provided data.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 3000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const result = await response.json();
    const generatedReport = result.choices[0].message.content;

    return NextResponse.json({
      report: generatedReport
    });

  } catch (error) {
    console.error('Report generation error:', error);
    
    // 오류 발생 시 기본 리포트 반환
    const { planData, monitoringData } = await request.json();
    return NextResponse.json({
      report: generateDefaultReport(planData, monitoringData)
    });
  }
}

function generateDefaultReport(planData: any, monitoringData: any) {
  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString();
  
  return `# ${planData.projectInfo?.projectName || 'Project'} - Comprehensive Report

## Executive Summary
This comprehensive analysis provides insights into the current status and performance of the ${planData.projectInfo?.projectName} based on planning data and real-time monitoring information.

**Key Highlights:**
- Project Progress: ${monitoringData.projectProgress}% completed
- Current Status: ${planData.projectInfo?.projectStatus}
- Monitoring Status: ${monitoringData.suspiciousLogDetected ? '⚠️ Warning - Suspicious activity detected' : '✅ Normal operations'}

## Project Overview

### Basic Information
- **Project Name**: ${planData.projectInfo?.projectName}
- **Project Number**: ${planData.projectInfo?.projectNumber}
- **Country/Region**: ${planData.projectInfo?.country} - ${planData.projectInfo?.region}
- **Implementing Agency**: ${planData.projectInfo?.responsibleAgency}
- **Funding Source**: ${planData.projectInfo?.fundingSource}
- **Project Type**: ${planData.projectInfo?.projectType}

### Project Objectives
${planData.projectInfo?.description}

## Progress Analysis

### Current Completion Status
The project has achieved **${monitoringData.projectProgress}%** completion as of the latest monitoring update. This represents significant progress toward the established project milestones.

### Timeline Assessment
- Current monitoring year: ${monitoringData.selectedYear}
- Activity logs recorded: ${monitoringData.projectLogs?.length || 0} transactions
- Latest activity: ${monitoringData.projectLogs?.[0]?.timestamp ? new Date(monitoringData.projectLogs[0].timestamp).toLocaleDateString() : 'N/A'}

## Infrastructure Assessment

### Climate Resilience Measures
The project encompasses ${planData.climateInfrastructure?.length || 0} major categories of climate adaptation infrastructure:

${planData.climateInfrastructure?.map((item, index) => `
**${index + 1}. ${item.disaster} Mitigation**
${item.measures.map(measure => `- ${measure}`).join('\n')}
`).join('\n')}

## Monitoring Insights

### Activity Analysis
${monitoringData.projectLogs?.map(log => `
**${log.title}** (${log.id})
- Status: ${log.status.toUpperCase()}
- Impact Level: ${log.impact}
- Date: ${new Date(log.timestamp).toLocaleDateString()}
- Description: ${log.description}
`).join('\n')}

${monitoringData.suspiciousLogDetected ? `
### ⚠️ Critical Alert
Suspicious activity has been detected in the monitoring system. This requires immediate investigation to ensure project integrity and security.
` : ''}

## Risk Assessment

### Current Risk Factors
${monitoringData.suspiciousLogDetected ? 
'- **HIGH PRIORITY**: Suspicious monitoring activity detected requiring immediate investigation' : 
'- **LOW RISK**: No critical issues detected in current monitoring data'}
- **Project Timeline**: On track with ${monitoringData.projectProgress}% completion
- **Technical Implementation**: Infrastructure measures are well-defined and comprehensive

## Recommendations

### Immediate Actions
${monitoringData.suspiciousLogDetected ? 
'1. **URGENT**: Investigate suspicious activity detected in monitoring logs\n2. Enhance security monitoring protocols' : 
'1. Continue monitoring current progress trajectory'}
3. Maintain regular stakeholder communication
4. Ensure proper documentation of all project activities

### Long-term Strategies
1. Develop comprehensive maintenance plans for implemented infrastructure
2. Establish long-term monitoring and evaluation frameworks
3. Plan for knowledge transfer and capacity building initiatives

## Conclusion

The ${planData.projectInfo?.projectName} demonstrates solid progress with ${monitoringData.projectProgress}% completion. The comprehensive approach to climate resilience infrastructure positions the project for successful outcomes.

${monitoringData.suspiciousLogDetected ? 
'**Critical Note**: The detection of suspicious activities requires immediate attention to maintain project integrity and ensure successful completion.' : 
'The project appears to be progressing well with no critical issues identified.'}

---
**Report Generated**: ${currentDate} at ${currentTime}  
**Data Sources**: Project planning documents, real-time monitoring system  
**Analysis Period**: Current as of ${monitoringData.selectedYear}`;
}
