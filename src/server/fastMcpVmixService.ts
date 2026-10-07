import { 
  FastMcpAttachment, 
  VmixInputItem, 
  VmixWorkflowCue, 
  VmixAutoWorkflow, 
  FastMcpToolLog, 
  FastMcpVmixServerState,
  GeneratedScript 
} from '../types';

/**
 * FastMCP vMix Server Core Implementation
 * Implements the Model Context Protocol (FastMCP) standard for live video switcher automation.
 * Supports media attachments, automated Rundown workflow execution, real-time tally, and vMix Web API integration.
 */

// Initial 8-channel virtual broadcast inputs
const INITIAL_INPUTS: VmixInputItem[] = [
  {
    number: 1,
    key: 'input-cam-anchor-1',
    name: 'CAM 1: Main Anchor Desk',
    type: 'Camera',
    state: 'Running',
    tally: 'program',
    volume: 100,
    muted: false,
    attachment: {
      id: 'att-anchor-cam-1',
      inputNumber: 1,
      name: 'Studio Anchor PTZ Cam Feed (4K HDR)',
      type: 'camera',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-news-studio-studio-desk-broadcasting-41554-large.mp4',
      mimeType: 'video/mp4',
      attachedAt: new Date(Date.now() - 3600000).toISOString(),
      token: 'fastmcp_cam_token_01',
      autoPlay: true,
      loop: true,
    }
  },
  {
    number: 2,
    key: 'input-cam-studio-2',
    name: 'CAM 2: Wide Studio / Video Wall',
    type: 'Camera',
    state: 'Running',
    tally: 'preview',
    volume: 100,
    muted: false,
    attachment: {
      id: 'att-anchor-cam-2',
      inputNumber: 2,
      name: 'Wide Studio Angle - Chroma Background',
      type: 'camera',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-news-anchor-on-chroma-key-studio-41551-large.mp4',
      mimeType: 'video/mp4',
      attachedAt: new Date(Date.now() - 3200000).toISOString(),
      token: 'fastmcp_cam_token_02',
      autoPlay: true,
      loop: true,
    }
  },
  {
    number: 3,
    key: 'input-ai-package-3',
    name: 'CLIP: Veo AI News Package (B-Roll)',
    type: 'Video',
    state: 'Paused',
    tally: 'safe',
    durationMs: 45000,
    positionMs: 0,
    loop: false,
    volume: 85,
    muted: false,
    attachment: {
      id: 'att-veo-package-03',
      inputNumber: 3,
      name: 'Veo 3.1 AI Synthesized News Reel',
      type: 'video',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-holographic-data-screen-41552-large.mp4',
      mimeType: 'video/mp4',
      attachedAt: new Date(Date.now() - 1800000).toISOString(),
      token: 'fastmcp_video_token_03',
      autoPlay: true,
      loop: false,
    }
  },
  {
    number: 4,
    key: 'input-gt-lowerthird-4',
    name: 'TITLE: GNN GT Animated Lower Third',
    type: 'Title',
    state: 'Running',
    tally: 'safe',
    titleFields: {
      'Headline': 'GLOBAL NEWS NETWORK BROADCAST TRANSMISSION',
      'Subtitle': 'Live Real-Time Multi-Agent OS & FastMCP Orchestration',
      'Reporter': 'Marcus Vance — Chief International Correspondent',
      'Location': 'GNN Broadcast Headquarters • Studio B',
    }
  },
  {
    number: 5,
    key: 'input-breaking-bug-5',
    name: 'GRAPHIC: Breaking News Banner & Stinger',
    type: 'Image',
    state: 'Running',
    tally: 'safe',
    titleFields: {
      'AlertText': 'BREAKING DEVELOPMENTS',
      'Ticker': 'Markets rise sharply on AI innovation indices • Cloud SQL distributed replica online in Singapore',
    }
  },
  {
    number: 6,
    key: 'input-virtualset-6',
    name: 'VIRTUAL SET: Imagen 4K Cyber Studio',
    type: 'VirtualSet',
    state: 'Running',
    tally: 'safe',
    attachment: {
      id: 'att-imagen-set-06',
      inputNumber: 6,
      name: 'Futuristic Studio Backplate (Imagen 3)',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&auto=format&fit=crop&q=80',
      mimeType: 'image/jpeg',
      attachedAt: new Date(Date.now() - 2500000).toISOString(),
      token: 'fastmcp_img_token_06',
    }
  },
  {
    number: 7,
    key: 'input-audio-vo-7',
    name: 'AUDIO: Vocal Lab VO & Bed Bus',
    type: 'Audio',
    state: 'Paused',
    tally: 'safe',
    volume: 90,
    muted: false,
    attachment: {
      id: 'att-vocal-vo-07',
      inputNumber: 7,
      name: 'ElevenLabs / Vocal Lab Master Narration',
      type: 'audio',
      url: 'https://actions.google.com/sounds/v1/science_fiction/deep_space_drone.ogg',
      mimeType: 'audio/ogg',
      attachedAt: new Date(Date.now() - 1200000).toISOString(),
      token: 'fastmcp_audio_token_07',
      autoPlay: true,
      loop: true,
    }
  },
  {
    number: 8,
    key: 'input-guest-feed-8',
    name: 'GUEST: vMix Call / NDI Stream',
    type: 'Camera',
    state: 'Running',
    tally: 'safe',
    volume: 95,
    muted: false,
    attachment: {
      id: 'att-guest-ndi-08',
      inputNumber: 8,
      name: 'Dr. Elena Rostova — Science & Tech Fellow',
      type: 'camera',
      url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80',
      mimeType: 'image/jpeg',
      attachedAt: new Date(Date.now() - 900000).toISOString(),
      token: 'fastmcp_guest_token_08',
    }
  }
];

// Standard Automation Workflows
export const DEFAULT_VMIX_WORKFLOWS: VmixAutoWorkflow[] = [
  {
    id: 'wf-news-bulletin-auto',
    name: 'Automated News Bulletin Rundown',
    description: 'Sequenced rundown: Anchor intro, auto-cued Lower-Third, smooth transition to AI package, audio voiceover ducking, and outro return.',
    category: 'Standard Bulletin',
    triggerEvent: 'manual',
    status: 'idle',
    activeCueIndex: 0,
    totalEstimatedDuration: 35,
    cues: [
      {
        id: 'cue-1',
        stepNumber: 1,
        stepName: 'Cue Main Anchor on PGM',
        action: 'switch_input',
        targetInput: 1,
        transitionType: 'Cut',
        durationMs: 0,
        delayAfterMs: 1500,
        status: 'pending',
        logNote: 'Cut camera 1 to Program bus'
      },
      {
        id: 'cue-2',
        stepNumber: 2,
        stepName: 'Fire Lower-Third Overlay (Overlay 1)',
        action: 'trigger_overlay',
        targetInput: 4,
        overlayChannel: 1,
        overlayAction: 'In',
        delayAfterMs: 4000,
        status: 'pending',
        logNote: 'Lower-third graphic in on Channel 1'
      },
      {
        id: 'cue-3',
        stepNumber: 3,
        stepName: 'Retract Lower-Third Overlay',
        action: 'trigger_overlay',
        targetInput: 4,
        overlayChannel: 1,
        overlayAction: 'Out',
        delayAfterMs: 1000,
        status: 'pending',
        logNote: 'Lower-third graphic out'
      },
      {
        id: 'cue-4',
        stepNumber: 4,
        stepName: 'Transition to Veo AI Video Package',
        action: 'transition',
        targetInput: 3,
        transitionType: 'Fade',
        durationMs: 750,
        delayAfterMs: 3000,
        status: 'pending',
        logNote: 'Dissolve to Input 3 (AI Video Package)'
      },
      {
        id: 'cue-5',
        stepNumber: 5,
        stepName: 'Trigger Vocal Lab VO & Duck Music Bed',
        action: 'duck_audio',
        targetInput: 7,
        delayAfterMs: 8000,
        status: 'pending',
        logNote: 'Start Vocal Lab narration audio with ducking on Bus B'
      },
      {
        id: 'cue-6',
        stepNumber: 6,
        stepName: 'Fire News Ticker Overlay (Overlay 2)',
        action: 'trigger_overlay',
        targetInput: 5,
        overlayChannel: 2,
        overlayAction: 'In',
        delayAfterMs: 6000,
        status: 'pending',
        logNote: 'Ticker overlay active'
      },
      {
        id: 'cue-7',
        stepNumber: 7,
        stepName: 'Return to Studio Wide Cam 2 with Outro',
        action: 'transition',
        targetInput: 2,
        transitionType: 'Wipe',
        durationMs: 800,
        delayAfterMs: 2500,
        status: 'pending',
        logNote: 'Wipe back to Cam 2'
      },
      {
        id: 'cue-8',
        stepNumber: 8,
        stepName: 'Clear All Overlays & Safe State',
        action: 'trigger_overlay',
        targetInput: 0,
        overlayChannel: 2,
        overlayAction: 'Out',
        delayAfterMs: 1000,
        status: 'pending',
        logNote: 'Complete rundown sequence. Studio safe.'
      }
    ]
  },
  {
    id: 'wf-breaking-news-flash',
    name: 'Breaking News Flash Automation',
    description: 'Emergency override: Stinger transition, full-screen red Breaking Alert bug, anchor cue, and urgent headline injection.',
    category: 'Breaking News',
    triggerEvent: 'manual',
    status: 'idle',
    activeCueIndex: 0,
    totalEstimatedDuration: 18,
    cues: [
      {
        id: 'b-cue-1',
        stepNumber: 1,
        stepName: 'Fire Stinger Transition & Alert Slate',
        action: 'transition',
        targetInput: 5,
        transitionType: 'Stinger',
        durationMs: 1000,
        delayAfterMs: 2000,
        status: 'pending',
        logNote: 'Red emergency breaking slate active'
      },
      {
        id: 'b-cue-2',
        stepNumber: 2,
        stepName: 'Inject Breaking Alert Overlay (Overlay 4)',
        action: 'trigger_overlay',
        targetInput: 5,
        overlayChannel: 4,
        overlayAction: 'In',
        delayAfterMs: 3000,
        status: 'pending',
        logNote: 'Overlay 4 flashing red bug'
      },
      {
        id: 'b-cue-3',
        stepNumber: 3,
        stepName: 'Cut to Anchor Desk CAM 1 with Live Tally',
        action: 'switch_input',
        targetInput: 1,
        transitionType: 'Cut',
        durationMs: 0,
        delayAfterMs: 4000,
        status: 'pending',
        logNote: 'Live camera anchor broadcast'
      },
      {
        id: 'b-cue-4',
        stepNumber: 4,
        stepName: 'Retract Breaking Bug to Standard News Ticker',
        action: 'trigger_overlay',
        targetInput: 5,
        overlayChannel: 4,
        overlayAction: 'Out',
        delayAfterMs: 1500,
        status: 'pending',
        logNote: 'Transition to standard broadcast'
      }
    ]
  }
];

class FastMcpVmixManager {
  private state: FastMcpVmixServerState;
  private workflows: VmixAutoWorkflow[];
  private activeWorkflowTimer: any = null;

  constructor() {
    this.state = {
      connected: true,
      isSimulated: true,
      vmixHost: process.env.VMIX_HOST || '127.0.0.1',
      vmixPort: parseInt(process.env.VMIX_PORT || '8088', 10),
      webApiEndpoint: `http://${process.env.VMIX_HOST || '127.0.0.1'}:${process.env.VMIX_PORT || '8088'}/api`,
      fastMcpEndpoint: 'mcp://fastmcp-vmix.internal:8088/v1',
      version: '27.0.0.83 (FastMCP Gateway Edition)',
      programInput: 1,
      previewInput: 2,
      isRecording: false,
      isStreaming: false,
      isExternalOut: true,
      audioMasterVolume: 100,
      audioBuses: {
        master: { volume: 100, muted: false, meterL: -12.4, meterR: -12.1 },
        busA: { volume: 90, muted: false, meterL: -14.2, meterR: -14.8 },
        busB: { volume: 75, muted: false, meterL: -18.6, meterR: -19.0 }
      },
      activeOverlays: [1], // Overlay 1 active initially
      inputs: JSON.parse(JSON.stringify(INITIAL_INPUTS)),
      attachments: INITIAL_INPUTS
        .filter(inp => inp.attachment)
        .map(inp => inp.attachment as FastMcpAttachment),
      lastHeartbeat: new Date().toISOString(),
      latencyMs: 8,
      recentLogs: [
        {
          id: 'log-init-1',
          timestamp: new Date().toISOString(),
          toolName: 'fastmcp_initialize',
          params: { transport: 'stdio+sse', protocol: 'mcp-2024-11-05' },
          result: { status: 'bound', registeredTools: 8, registeredResources: 3 },
          durationMs: 4,
          success: true,
          source: 'FastMCP-Server'
        }
      ]
    };

    this.workflows = JSON.parse(JSON.stringify(DEFAULT_VMIX_WORKFLOWS));
    this.updateTally();
  }

  public getState(): FastMcpVmixServerState {
    this.state.lastHeartbeat = new Date().toISOString();
    return {
      ...this.state,
      attachments: this.state.inputs
        .filter(inp => inp.attachment)
        .map(inp => inp.attachment as FastMcpAttachment)
    };
  }

  public getWorkflows(): VmixAutoWorkflow[] {
    return this.workflows;
  }

  private updateTally() {
    this.state.inputs.forEach(inp => {
      if (inp.number === this.state.programInput) {
        inp.tally = 'program';
      } else if (inp.number === this.state.previewInput) {
        inp.tally = 'preview';
      } else {
        inp.tally = 'safe';
      }
    });
  }

  private logTool(toolName: string, params: Record<string, any>, result: Record<string, any>, durationMs: number, success = true, source: 'FastMCP-Server' | 'AI-Auto-Director' | 'Manual-Console' = 'FastMCP-Server') {
    const logItem: FastMcpToolLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      toolName,
      params,
      result,
      durationMs,
      success,
      source
    };
    this.state.recentLogs.unshift(logItem);
    if (this.state.recentLogs.length > 50) {
      this.state.recentLogs.pop();
    }
  }

  /**
   * FastMCP Tool: vmix_attach_media
   * Attaches an external media asset or generated file to a specific vMix input slot.
   */
  public attachMedia(inputNumber: number, asset: { name: string; type: string; url: string; assetId?: string; mimeType?: string; autoPlay?: boolean; loop?: boolean }) {
    const startTime = Date.now();
    const input = this.state.inputs.find(inp => inp.number === inputNumber);
    if (!input) {
      throw new Error(`vMix input ${inputNumber} does not exist (valid range: 1..${this.state.inputs.length})`);
    }

    const attachment: FastMcpAttachment = {
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      inputNumber,
      assetId: asset.assetId,
      name: asset.name,
      type: (asset.type as any) || 'video',
      url: asset.url,
      mimeType: asset.mimeType || (asset.type === 'video' ? 'video/mp4' : asset.type === 'audio' ? 'audio/mpeg' : 'image/jpeg'),
      attachedAt: new Date().toISOString(),
      token: `fastmcp_att_${Date.now()}`,
      autoPlay: asset.autoPlay !== false,
      loop: asset.loop === true,
    };

    input.attachment = attachment;
    input.name = `${asset.type.toUpperCase()}: ${asset.name}`;
    if (asset.type === 'video') input.type = 'Video';
    else if (asset.type === 'image') input.type = 'Image';
    else if (asset.type === 'audio') input.type = 'Audio';

    const durationMs = Date.now() - startTime;
    this.logTool('vmix_attach_media', { inputNumber, assetName: asset.name, type: asset.type }, { success: true, attachmentId: attachment.id, token: attachment.token }, durationMs);

    return {
      success: true,
      message: `Successfully attached [${asset.name}] to vMix Input ${inputNumber} via FastMCP protocol.`,
      attachment,
      input
    };
  }

  /**
   * FastMCP Tool: vmix_switch_input
   * Transitions active Program or Preview inputs.
   */
  public switchInput(targetInput: number, transitionType: 'Cut' | 'Fade' | 'Zoom' | 'Wipe' | 'Stinger' | 'Merge' = 'Cut', durationMs = 500, toPreview = false) {
    const startTime = Date.now();
    const input = this.state.inputs.find(inp => inp.number === targetInput);
    if (!input) {
      throw new Error(`Input ${targetInput} not found`);
    }

    if (toPreview) {
      this.state.previewInput = targetInput;
    } else {
      // Swapping Program & Preview
      const previousProgram = this.state.programInput;
      this.state.programInput = targetInput;
      if (this.state.previewInput === targetInput) {
        this.state.previewInput = previousProgram;
      }
    }

    this.updateTally();
    const elapsed = Date.now() - startTime;

    this.logTool('vmix_switch_input', { targetInput, transitionType, durationMs, toPreview }, { newProgram: this.state.programInput, newPreview: this.state.previewInput }, elapsed);

    return {
      success: true,
      programInput: this.state.programInput,
      previewInput: this.state.previewInput,
      transitionType,
      durationMs
    };
  }

  /**
   * FastMCP Tool: vmix_trigger_overlay
   * Toggles or activates Overlay channels 1..4
   */
  public triggerOverlay(channel: 1 | 2 | 3 | 4, action: 'In' | 'Out' | 'Toggle' = 'Toggle', targetInput?: number) {
    const startTime = Date.now();
    const isActive = this.state.activeOverlays.includes(channel);

    if (action === 'In' || (action === 'Toggle' && !isActive)) {
      if (!this.state.activeOverlays.includes(channel)) {
        this.state.activeOverlays.push(channel);
      }
    } else {
      this.state.activeOverlays = this.state.activeOverlays.filter(ch => ch !== channel);
    }

    const elapsed = Date.now() - startTime;
    this.logTool('vmix_trigger_overlay', { channel, action, targetInput }, { activeOverlays: this.state.activeOverlays }, elapsed);

    return {
      success: true,
      channel,
      active: this.state.activeOverlays.includes(channel),
      activeOverlays: this.state.activeOverlays
    };
  }

  /**
   * FastMCP Tool: vmix_set_text
   * Injects dynamic news headlines, lower third captions, or reporter names into GT Title inputs.
   */
  public setText(inputNumber: number, field: string, value: string) {
    const startTime = Date.now();
    const input = this.state.inputs.find(inp => inp.number === inputNumber);
    if (!input) {
      throw new Error(`Input ${inputNumber} not found`);
    }

    if (!input.titleFields) {
      input.titleFields = {};
    }
    input.titleFields[field] = value;

    const elapsed = Date.now() - startTime;
    this.logTool('vmix_set_text', { inputNumber, field, value }, { success: true, currentFields: input.titleFields }, elapsed);

    return {
      success: true,
      inputNumber,
      titleFields: input.titleFields
    };
  }

  /**
   * FastMCP Tool: vmix_stream_record
   * Starts or stops live broadcast streaming and master recording.
   */
  public toggleStreamRecord(type: 'stream' | 'record' | 'both', state?: boolean) {
    const startTime = Date.now();
    if (type === 'stream' || type === 'both') {
      this.state.isStreaming = state !== undefined ? state : !this.state.isStreaming;
    }
    if (type === 'record' || type === 'both') {
      this.state.isRecording = state !== undefined ? state : !this.state.isRecording;
    }

    const elapsed = Date.now() - startTime;
    this.logTool('vmix_stream_record', { type, state }, { isStreaming: this.state.isStreaming, isRecording: this.state.isRecording }, elapsed);

    return {
      success: true,
      isStreaming: this.state.isStreaming,
      isRecording: this.state.isRecording
    };
  }

  /**
   * FastMCP Tool: vmix_control_audio
   * Controls master audio volume, mute status, or bus ducking.
   */
  public controlAudio(bus: 'master' | 'busA' | 'busB', volume?: number, muted?: boolean, duck?: boolean) {
    const startTime = Date.now();
    const targetBus = this.state.audioBuses[bus];
    if (targetBus) {
      if (volume !== undefined) targetBus.volume = Math.max(0, Math.min(100, volume));
      if (muted !== undefined) targetBus.muted = muted;
      if (duck) {
        targetBus.volume = Math.max(20, targetBus.volume - 40); // Duck 40%
      }
    }

    const elapsed = Date.now() - startTime;
    this.logTool('vmix_control_audio', { bus, volume, muted, duck }, { busState: targetBus }, elapsed);

    return {
      success: true,
      bus,
      busState: targetBus
    };
  }

  /**
   * FastMCP Automatic Work Ability: Run Automated Workflow
   * Steps through cues sequentially, firing vMix actions, switching inputs, updating overlays, and adjusting audio.
   */
  public async executeWorkflow(workflowId: string, onStepUpdate?: (step: VmixWorkflowCue) => void): Promise<VmixAutoWorkflow> {
    const wf = this.workflows.find(w => w.id === workflowId);
    if (!wf) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    if (this.activeWorkflowTimer) {
      clearTimeout(this.activeWorkflowTimer);
      this.activeWorkflowTimer = null;
    }

    wf.status = 'running';
    wf.activeCueIndex = 0;
    this.state.activeWorkflow = wf;

    // Reset cues
    wf.cues.forEach(c => c.status = 'pending');

    this.logTool('vmix_auto_workflow_run', { workflowId, totalCues: wf.cues.length }, { status: 'started' }, 5, true, 'AI-Auto-Director');

    // Run execution loop asynchronously in steps
    const executeStep = (index: number) => {
      if (index >= wf.cues.length) {
        wf.status = 'completed';
        this.state.activeWorkflow = undefined;
        this.logTool('vmix_auto_workflow_run', { workflowId }, { status: 'completed', duration: wf.totalEstimatedDuration }, 10, true, 'AI-Auto-Director');
        return;
      }

      wf.activeCueIndex = index;
      const cue = wf.cues[index];
      cue.status = 'active';

      // Perform the actual vMix action
      try {
        switch (cue.action) {
          case 'switch_input':
          case 'transition':
            this.switchInput(cue.targetInput, cue.transitionType || 'Cut', cue.durationMs || 500);
            break;
          case 'trigger_overlay':
            this.triggerOverlay(cue.overlayChannel || 1, cue.overlayAction || 'Toggle', cue.targetInput);
            break;
          case 'set_text':
            if (cue.textPayload) {
              this.setText(cue.targetInput, cue.textPayload.field, cue.textPayload.value);
            }
            break;
          case 'duck_audio':
            this.controlAudio('busB', undefined, undefined, true);
            break;
        }
      } catch (err: any) {
        console.warn(`[FastMCP Auto-Director] Cue step ${index + 1} warning:`, err.message);
      }

      cue.status = 'completed';
      if (onStepUpdate) {
        onStepUpdate(cue);
      }

      // Schedule next step
      const delay = Math.min(Math.max(cue.delayAfterMs || 2000, 1000), 10000);
      this.activeWorkflowTimer = setTimeout(() => {
        executeStep(index + 1);
      }, delay);
    };

    executeStep(0);
    return wf;
  }

  public stopWorkflow(workflowId: string) {
    if (this.activeWorkflowTimer) {
      clearTimeout(this.activeWorkflowTimer);
      this.activeWorkflowTimer = null;
    }
    const wf = this.workflows.find(w => w.id === workflowId);
    if (wf) {
      wf.status = 'idle';
      wf.cues.forEach(c => {
        if (c.status === 'active') c.status = 'completed';
      });
    }
    this.state.activeWorkflow = undefined;
    this.logTool('vmix_auto_workflow_stop', { workflowId }, { status: 'aborted' }, 5, true, 'AI-Auto-Director');
    return { success: true, message: `Workflow ${workflowId} stopped.` };
  }

  /**
   * FastMCP Automatic Work Ability: Script-to-Air Auto-Attacher
   * Inspects a generated or approved news script and automatically attaches its assets
   * into vMix inputs, updates lower-third title fields, and populates the auto-rundown.
   */
  public autoAttachScript(script: GeneratedScript, assetUrl?: string) {
    const startTime = Date.now();

    // 1. Update Title / Lower-Third on Input 4
    this.setText(4, 'Headline', script.headline || script.title);
    this.setText(4, 'Subtitle', script.hook || 'GNN Global News Update');
    this.setText(4, 'Reporter', script.author || 'GNN AI Newsroom');
    this.setText(4, 'Location', 'GNN Central Hub • Live Wire');

    // 2. Attach video asset to Input 3 if provided
    let attachedVideo: FastMcpAttachment | undefined;
    if (assetUrl) {
      const res = this.attachMedia(3, {
        name: `Script Reel: ${script.title.substring(0, 30)}`,
        type: 'video',
        url: assetUrl,
        assetId: script.id,
        autoPlay: true,
        loop: false
      });
      attachedVideo = res.attachment;
    }

    // 3. Create a customized Auto-Workflow for this script
    const scriptWorkflow: VmixAutoWorkflow = {
      id: `wf-script-${script.id || Date.now()}`,
      name: `Rundown: ${script.title.substring(0, 35)}...`,
      description: `Automated broadcast sequence for script: "${script.headline || script.title}"`,
      category: 'Script-to-Air',
      triggerEvent: 'script_approved',
      status: 'idle',
      activeCueIndex: 0,
      totalEstimatedDuration: 28,
      cues: [
        {
          id: `sq-1-${Date.now()}`,
          stepNumber: 1,
          stepName: 'Cut to Anchor & Flash Headline Lower-Third',
          action: 'switch_input',
          targetInput: 1,
          transitionType: 'Cut',
          delayAfterMs: 2500,
          status: 'pending',
          logNote: `Cue Anchor Desk for story: ${script.title}`
        },
        {
          id: `sq-2-${Date.now()}`,
          stepNumber: 2,
          stepName: 'Fire Custom Lower-Third Title (Overlay 1)',
          action: 'trigger_overlay',
          targetInput: 4,
          overlayChannel: 1,
          overlayAction: 'In',
          delayAfterMs: 4000,
          status: 'pending',
          logNote: `Overlay text: "${script.headline || script.title}"`
        },
        {
          id: `sq-3-${Date.now()}`,
          stepNumber: 3,
          stepName: 'Fade to Attached Video Package (Input 3)',
          action: 'transition',
          targetInput: 3,
          transitionType: 'Fade',
          durationMs: 700,
          delayAfterMs: 6000,
          status: 'pending',
          logNote: 'Dissolve to Video B-Roll'
        },
        {
          id: `sq-4-${Date.now()}`,
          stepNumber: 4,
          stepName: 'Fire News Ticker Bullet (Overlay 2)',
          action: 'trigger_overlay',
          targetInput: 5,
          overlayChannel: 2,
          overlayAction: 'In',
          delayAfterMs: 5000,
          status: 'pending',
          logNote: 'Ticker active'
        },
        {
          id: `sq-5-${Date.now()}`,
          stepNumber: 5,
          stepName: 'Wipe Back to Anchor Desk & Clear Graphics',
          action: 'transition',
          targetInput: 1,
          transitionType: 'Wipe',
          durationMs: 600,
          delayAfterMs: 2000,
          status: 'pending',
          logNote: 'Anchor conclusion wrap-up'
        },
        {
          id: `sq-6-${Date.now()}`,
          stepNumber: 6,
          stepName: 'Clear All Overlays (Safe)',
          action: 'trigger_overlay',
          targetInput: 0,
          overlayChannel: 1,
          overlayAction: 'Out',
          delayAfterMs: 1000,
          status: 'pending',
          logNote: 'Studio cleared'
        }
      ]
    };

    // Add to workflows list if not already present
    const existingIdx = this.workflows.findIndex(w => w.id === scriptWorkflow.id);
    if (existingIdx >= 0) {
      this.workflows[existingIdx] = scriptWorkflow;
    } else {
      this.workflows.unshift(scriptWorkflow);
    }

    const elapsed = Date.now() - startTime;
    this.logTool('vmix_script_auto_attach', { scriptId: script.id, title: script.title }, { workflowId: scriptWorkflow.id, titleFieldsUpdated: true, videoAttached: !!assetUrl }, elapsed, true, 'AI-Auto-Director');

    return {
      success: true,
      message: `FastMCP automatically attached news script "${script.title}" to vMix Inputs & assembled Rundown Workflow.`,
      workflow: scriptWorkflow,
      attachedVideo
    };
  }

  /**
   * FastMCP Protocol Schema Definition
   * Returns tools, resources, and prompts as per FastMCP specification.
   */
  public getFastMcpSpec() {
    return {
      protocolVersion: '2024-11-05',
      serverInfo: {
        name: 'gnn-fastmcp-vmix-switcher',
        version: '1.2.0',
        description: 'FastMCP Model Context Protocol Server for vMix Live Broadcast Switcher with Media Attachments and Automatic Workflows.'
      },
      capabilities: {
        tools: { listChanged: false },
        resources: { subscribe: true, listChanged: false },
        prompts: { listChanged: false },
        attachments: { supported: true, mimeTypes: ['video/*', 'image/*', 'audio/*', 'application/json', 'text/plain'] }
      },
      tools: [
        {
          name: 'vmix_attach_media',
          description: 'Attaches media asset (video reel, audio clip, image backplate, or virtual set) to a vMix input slot via FastMCP attachment protocol.',
          inputSchema: {
            type: 'object',
            properties: {
              inputNumber: { type: 'number', description: 'vMix input index (1..8)' },
              assetName: { type: 'string', description: 'Human-readable title of media' },
              type: { type: 'string', enum: ['video', 'image', 'audio', 'title', 'camera'] },
              url: { type: 'string', description: 'HTTP/HTTPS/Blob URL or media path' },
              autoPlay: { type: 'boolean', default: true },
              loop: { type: 'boolean', default: false }
            },
            required: ['inputNumber', 'assetName', 'type', 'url']
          }
        },
        {
          name: 'vmix_auto_workflow_run',
          description: 'Orchestrates and executes an automated multi-step live broadcast rundown sequence with transitions, lower-thirds, and audio ducking.',
          inputSchema: {
            type: 'object',
            properties: {
              workflowId: { type: 'string', description: 'Unique ID of workflow (e.g. wf-news-bulletin-auto, wf-breaking-news-flash)' }
            },
            required: ['workflowId']
          }
        },
        {
          name: 'vmix_switch_input',
          description: 'Executes transitions between active Program (PGM) and Preview (PVW) video inputs.',
          inputSchema: {
            type: 'object',
            properties: {
              targetInput: { type: 'number', description: 'vMix input index to switch to' },
              transitionType: { type: 'string', enum: ['Cut', 'Fade', 'Zoom', 'Wipe', 'Stinger', 'Merge'], default: 'Cut' },
              durationMs: { type: 'number', default: 500 },
              toPreview: { type: 'boolean', default: false }
            },
            required: ['targetInput']
          }
        },
        {
          name: 'vmix_trigger_overlay',
          description: 'Fires or toggles lower-third graphics, news tickers, or breaking bugs on Overlay Channels 1 to 4.',
          inputSchema: {
            type: 'object',
            properties: {
              channel: { type: 'number', enum: [1, 2, 3, 4], description: 'Overlay channel number' },
              action: { type: 'string', enum: ['In', 'Out', 'Toggle'], default: 'Toggle' },
              targetInput: { type: 'number', description: 'Optional input number for overlay' }
            },
            required: ['channel']
          }
        },
        {
          name: 'vmix_set_text',
          description: 'Injects live text content into vMix GT Title / XAML template inputs (Headline, Subtitle, Reporter, Location).',
          inputSchema: {
            type: 'object',
            properties: {
              inputNumber: { type: 'number', description: 'Title input index' },
              field: { type: 'string', description: 'Name of the title text field' },
              value: { type: 'string', description: 'Text string to display on air' }
            },
            required: ['inputNumber', 'field', 'value']
          }
        },
        {
          name: 'vmix_stream_record',
          description: 'Starts or stops live RTMP/SRT streaming and high-bitrate master recording.',
          inputSchema: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['stream', 'record', 'both'] },
              state: { type: 'boolean', description: 'True to start, false to stop' }
            },
            required: ['type']
          }
        }
      ],
      resources: [
        {
          uri: 'vmix://state',
          name: 'Current vMix Switcher Live State',
          description: 'Real-time JSON state snapshot containing Program/Preview inputs, tally, audio levels, and active overlays.',
          mimeType: 'application/json'
        },
        {
          uri: 'vmix://attachments',
          name: 'FastMCP Media Attachments List',
          description: 'Active media attachments mapped to vMix input channels.',
          mimeType: 'application/json'
        },
        {
          uri: 'vmix://workflows',
          name: 'Automated Broadcast Rundown Workflows',
          description: 'Preconfigured and custom automated rundown cue sequences.',
          mimeType: 'application/json'
        }
      ],
      prompts: [
        {
          name: 'generate_broadcast_rundown',
          description: 'Synthesizes an automated vMix switching cue sheet and lower-third titles from a raw news script.',
          arguments: [
            { name: 'script_text', description: 'Full text or headline of news article', required: true }
          ]
        }
      ]
    };
  }
}

export const fastMcpVmix = new FastMcpVmixManager();
