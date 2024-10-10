import*as JD from"./jodash.js";import*as QRS from"./qrscanner.js";import*as I18 from"./intmain_i18n.js";import"./blx.js";import"./blStore.js";import"./FileSaver.js";let VERSION="V0.10 / 09.10.2024",COPYRIGHT="(C)JoEmbedded.de",connectionLevel=0,lastAdvertisingName,blxDevice,uplStatus={totalsize:0,mode:"",sumsize:0,filesize:0,filename:"",fproc:0,ndata:!1},deviceListDB=[],defLang=I18.i18_availLang[0],setupOptions={dtheme:!1,font:100,lang:defLang,server:"../sync/blxremote.php",accesstoken:"123456"},isUrlGit,sidebuttonMaincontent=(document.getElementById("bd-version").textContent=VERSION+(0<window.jdDebug?` (Dbg:${window.jdDebug})`:""),document.getElementById("sidebutton-maincontent")),sidebuttonTerminal=document.getElementById("sidebutton-terminal"),sidebuttonGraph=document.getElementById("sidebutton-graph"),sidebuttonBluetooth=document.getElementById("sidebutton-bluetooth"),sidebuttonSetup=document.getElementById("sidebutton-setup"),sidebuttonServersync=document.getElementById("sidebutton-serversync"),sidebuttonQRscan=document.getElementById("sidebutton-qrscan"),sectionMain=document.getElementById("section_main"),sectionTerminal=document.getElementById("section_terminal"),sectionMainEnabled,sectionTerminalEnabled,bdOnline=(sidebuttonMaincontent.addEventListener("click",()=>sectionMain.scrollIntoView(!0)),sidebuttonTerminal.addEventListener("click",()=>sectionTerminal.scrollIntoView(!1)),document.getElementById("bd-online")),bdOffline=document.getElementById("bd-offline"),lastOnlineState,blxInfoLine=(sidebuttonBluetooth.addEventListener("click",blxConnect),sidebuttonSetup.addEventListener("click",doSetupDialog),sidebuttonServersync.addEventListener("click",runServerSync),sidebuttonQRscan.addEventListener("click",bdRunQRscanner),document.getElementById("blxInfoLine")),blxGraph=document.getElementById("blxGraph");const blxCmdRes=document.getElementById("blxCmdRes");let blxConnectButtonText=document.getElementById("blxConnectButtonText"),blxMemory=document.getElementById("blxMemory"),blxSync=document.getElementById("blxSync"),blxSignal=document.getElementById("blxSignal"),blxMeasureData=document.getElementById("blxMeasureData"),blxDeviceName=document.getElementById("blxDeviceName"),blxMAC=document.getElementById("blxMAC"),blxType=document.getElementById("blxType"),blxFW=document.getElementById("blxFW"),blxPIN=document.getElementById("blxPIN"),blxPinEnter=document.getElementById("blxPinEnter"),blxSyncButton=document.getElementById("blxSyncButton"),blxMeasureButton=document.getElementById("blxMeasureButton"),blxUploadButton=document.getElementById("blxUploadButton"),blxInfoButton=document.getElementById("blxInfoButton"),blxClearButton=document.getElementById("blxClearButton"),blxParametersButton=document.getElementById("blxParametersButton"),blxSysParButton=document.getElementById("blxSysParButton"),blxSyncButtonSpan=document.getElementById("blxSyncButtonSpan"),blxUploadButtonSpan=document.getElementById("blxUploadButtonSpan"),blxInfoButtonSpan=document.getElementById("blxInfoButtonSpan"),blxClearButtonSpan=document.getElementById("blxClearButtonSpan"),blxParametersSpan=document.getElementById("blxParametersSpan"),blxSetPinButton=document.getElementById("blxSetPinButton"),blxScanPinButton=document.getElementById("blxScanPinButton"),navDevicelist=(blxSetPinButton.addEventListener("click",blxSetPin),blxScanPinButton.addEventListener("click",blxScanPin),blxInfoButton.addEventListener("click",blxMemoryInfo),blxSyncButton.addEventListener("click",blxSyncTime),blxUploadButton.addEventListener("click",blxUpload),blxMeasureButton.addEventListener("click",blxMeasure),blxClearButton.addEventListener("click",blxClearDevice),blxParametersButton.addEventListener("click",blxEditIparam),blxSysParButton.addEventListener("click",blxEditSysparam),document.getElementById("nav-devicelist")),bdurl=new URL(location);function ll(e){return I18.ll(e)}async function blxConnect(){let e=!1,t=(blxCmdRes&&(blxCmdRes.textContent="-"),disabler(!0),!1);try{2<=connectionLevel?(JD.spinnerShow("Bluetooth",""+ll("Disconnect"),10,!0),await _blxCmdSend(".d")):(void 0!==lastAdvertisingName&&(t=await JD.doDialogOK(""+ll("Reconnect?"),`${ll("Reconnect to Device?")}<br><b>${ll("Name")}: '${lastAdvertisingName}'</b><br>`+ll("OK to Reconnect (or close)"))),e=!0,t?await _blxCmdSend(".r"):await _blxCmdSend(".c"),await showLoggerDetails())}catch(e){JD.joPingError(),blxCmdRes&&(blxCmdRes.textContent=e+" [BCo]")}JD.spinnerClose(),disabler(!1),e&&JD.sidebarMax(.3)}function disabler(e){var t=blx.getPinOK();e?sidebuttonBluetooth.classList.add("jo-disabled"):sidebuttonBluetooth.classList.remove("jo-disabled");let n="none";!0!==t&&!1===e&&3<=connectionLevel&&(n="block"),blxPinEnter&&(blxPinEnter.style.display=n),0!=connectionLevel&&!0===t||(e=!0),blxSyncButton&&(blxSyncButton.disabled=e),blxMeasureButton&&(blxMeasureButton.disabled=e),blxUploadButton&&(blxUploadButton.disabled=e),blxInfoButton&&(blxInfoButton.disabled=e),blxClearButton&&(blxClearButton.disabled=e),blxParametersButton&&(blxParametersButton.disabled=e),blxSysParButton&&(blxSysParButton.disabled=e),n=void 0!==blxDevice&&1e3<=blxDevice.deviceType?"block":"none",blxSyncButtonSpan&&(blxSyncButtonSpan.style.display=n),blxUploadButtonSpan&&(blxUploadButtonSpan.style.display=n),blxInfoButtonSpan&&(blxInfoButtonSpan.style.display=n),blxClearButtonSpan&&(blxClearButtonSpan.style.display=n),blxParametersSpan&&(blxParametersSpan.style.display=n)}async function showLoggerDetails(){if(3<=connectionLevel){blxDevice=blx.getDevice(),blxMAC&&(blxMAC.textContent=blxDevice.deviceMAC),blxType&&(blxType.textContent=blxDevice.deviceType),blxFW&&(blxFW.textContent=blxDevice.firmwareVersion),4==connectionLevel&&1e3<=blxDevice.deviceType&&(await calculateMemory(!0),await showLink());var t=blxDevice.deltaToApp;let e=t+" "+ll("sec");864e5<t?e=`<span style='background-color: red'>${ll("Time lost!")}</span>`:86400<t&&(e=(t/86400).toFixed(3)+" "+ll("d")),blxSync&&(blxSync.innerHTML=e),blxInfoLine&&(blxInfoLine.textContent=ll("Connected")),blxMeasureData&&(blxMeasureData.innerHTML="-"),updateDeviceList()}}isUrlGit=bdurl.host.includes("github."),blx.setTerminal("blxTerminal",bleCallback),await getSetupOptions(),await updateDeviceList(),window.addEventListener("beforeunload",function(e){if(JD.spinnerGetBusy()||4==connectionLevel)return e.preventDefault(),"Reload/Leave?"}),JD.dashSetTimer1sec(blxtimer1sec);let _blxCmdResult,_blxCmdBusyFlag=!1,_blxCmdRBCnt=0;async function _blxCmdSend(e,t){_blxCmdResult=0,_blxCmdBusyFlag=!0,_blxCmdRBCnt=0;try{await blx.userSendCmd(e,t),console.log("CMD->",e),_blxCmdBusyFlag=!1,_blxCmdRBCnt=0}catch(e){console.log("ERROR:",e),_blxCmdBusyFlag=!1,_blxCmdRBCnt=0,_blxCmdResult=e,connectionLevel<=2&&bleCallback("CON",0)}}async function calculateMemory(n){let l="???";try{n&&await _blxCmdSend(".m");var a=blx.getMemory();let e,t=(e=0<a.max?(100*a.total/a.max).toFixed(2):ll("Unknown"),"???");switch(a.mode){case 2:case 0:t=ll("Rec.OFF");break;case 1:t=ll("LINEAR");break;case 3:t=ll("RING")}l="[Total: "+a.total+"("+e+"%,"+t+")",n&&(l+=" <br class='mobile-br'>New: "+a.incnew),l+="] Byte"}catch(e){JD.joPingError(),blxCmdRes&&(blxCmdRes.textContent=e+"[BcM]")}blxMemory.innerHTML=l}async function showLink(){let e=ll("(No Data)");try{await blStore.get(blxDevice.deviceMAC+"_xtract.edt");var t=blStore.result();void 0!==t&&(e="<a target='_blank' href='../gdraw/gdraw.html?st="+blxDevice.deviceMAC+"_xtract.edt&sn="+lastAdvertisingName+`'> ${ll("Show Graph")} </a><br class='mobile-br'> (`+t.v.akt_len+" Byte, "+t.v.ctime.toLocaleString()+")")}catch(e){JD.joPingError(),blxCmdRes&&(blxCmdRes.textContent=e+" [BsL]")}blxGraph.innerHTML=e}async function blxMemoryInfo(){disabler(!0),JD.spinnerShow(ll("Memory Info"),null,60,!0);try{await _blxCmdSend("v"),await calculateMemory(!0)}catch(e){JD.joPingError(),blxCmdRes&&(blxCmdRes.textContent=e+" [BMI]")}JD.spinnerClose(),disabler(!1)}async function blxClearDevice(){if(disabler(!0),await JD.doDialogOK(ll("Clear Device?"),ll("OK to clear Device Memory?"),null,!0)){JD.spinnerShow(ll("Clear Device"),null,250);try{void 0!==blxDevice.diskCheckOK&&!0===blxDevice.diskCheckOK?(blxInfoLine&&(blxInfoLine.textContent=ll("Start new Measure, Clear all Data")),await _blxCmdSend("n")):(blxInfoLine&&(blxInfoLine.textContent=ll("Start new Measure, Clear all Data (Clean FlashDisk, may need up to 240 sec)")),await _blxCmdSend("n1",24e4)),document.getElementById("blxMemory").textContent="-",await blStore.remove(blxDevice.deviceMAC+"_xtract.edt"),await showLink()}catch(e){JD.joPingError(),blxCmdRes&&(blxCmdRes.textContent=e+" [BCD]")}JD.spinnerClose()}disabler(!1)}async function blxSetPin(){blxCmdRes&&(blxCmdRes.textContent="-");var e=blxPIN.value;disabler(!0),JD.spinnerShow(ll("Set PIN"),null,300);try{if(e.length<1)throw"ERROR: PIN EMPTY";await _blxCmdSend(".i "+e),blxPIN.value="",await showLoggerDetails()}catch(e){JD.joPingError(),blxCmdRes&&(blxCmdRes.textContent=e+" [BSP]")}JD.spinnerClose(),disabler(!1)}async function blxScanPin(){await bdRunQRscanner(blxDevice.deviceMAC)}async function blxSyncTime(){disabler(!0),JD.spinnerShow(ll("Sync Device Time"),null,30,!0);try{await _blxCmdSend(".t set"),blxSync.textContent=0}catch(e){JD.joPingError(),blxCmdRes=blxCmdRes&&e+" [BST]"}JD.spinnerClose(),disabler(!1)}async function blxUpload(){disabler(!0),JD.spinnerShow(ll("Upload Data"),null,600,!1);try{await _blxCmdSend(".u"),await calculateMemory(!1),await _blxCmdSend(".x"),await showLink()}catch(e){JD.joPingError(),blxCmdRes&&(blxCmdRes.textContent=e+" [BUp]")}await updateDeviceList(),JD.spinnerClose(),disabler(!1)}let measureData="???";async function blxMeasure(){disabler(!0),JD.spinnerShow(ll("Measure"),null,30,!0),blxMeasureData.innerHTML=ll("Wait...");try{await _blxCmdSend("e 1")}catch(e){JD.joPingError(),blxCmdRes&&(blxCmdRes.textContent=e+" [BMe]")}JD.spinnerClose(),disabler(!1)}let p100_beschr=["*@100_System","*DEVICE_TYP","*MAX_CHANNELS","*HK_FLAGS","*NewCookie [Parameter 10-digit Timestamp.32]","Device_Name[BLE:$11/total:$41]","Period_sec[10..86400]","Period_Offset_sec[0..(Period_sec-1)]","Period_Alarm_sec[0..Period_sec]","Period_Internet_sec[0..604799]","Period_Internet_Alarm_sec[0..Period_Internet_sec]","UTC_Offset_sec[-43200..43200]","Flags (B0:Rec B1:Ring) (0: RecOff) B2:Compress","HK_flags (B0:Bat B1:Temp B2.Hum B3.Perc B4.Baro)","HK_reload[0..255]","Net_Mode (0:Off 1:OnOff 2:On_5min 3:Online)","ErrorPolicy (O:None 1:RetriesForAlarms, 2:RetriesForAll)","MinTemp_oC[-40..10]","Config0_U31 (B0:OffPer.Inet:On/Off B1,2:BLE:On/Mo/Li/MoLi B3:EnDS B4:CE:Off/On B5:Live:Off/On)","Configuration_Command[$79]","Internet_Starttime[Timestamp.32]"],pkan_beschr=["*@ChanNo","Action[0..65535] (B0:Meas B1:Cache B2:Alarms)","Physkan_no[0..65535]","Kan_caps_str[$8]","Src_index[0..255]","Unit[$8]","Mem_format[0..255]","DB_id[0..2e31]","Offset[float]","Factor[float]","Alarm_hi[float]","Alarm_lo[float]","Messbits[0..65535]","Xbytes[$32]"],p200_beschr=["*@200_Sys_Param","APN[$41]","Server/VPN[$41]","Script/Id[$41]","API Key[$41]","ConFlags[0..255] (B0:Verbose B1:RoamAllow B4:LOG_FILE (B5:LOG_UART) B7:Debug)","SIM Pin[0..65535] (opt)","APN User[$41]","APN Password[$41]","Max_creg[10..255]","Port[1..65535]","Server_timeout_0[1000..65535]","Server_timeout_run[1000..65535]","Modem Check Reload[60..3600]","Bat. Capacity (mAh)[0..100000]","Bat. Volts 0%[float]","Bat. Volts 100%[float]","Max Ringsize (Bytes)[1000..2e31]","mAmsec/Measure[0..1e9]","Mobile Protocol[0..255] B0:0/1:HTTP/HTTPS B1:PUSH B2,3:TCP/UDPSetup"],original_par;async function editParamDialogDo(e){var t="<div id='blxParameterEdit' class='jo-dialog-big'>";let n;return e?n=JD.prepareCustomDialog(ll("Edit Parameter")+" 'sys_param'",t,ll("Send...")):(n=JD.prepareCustomDialog(ll("Edit Parameter")+" 'iparam'",t,ll("Send..."),`<button id='editBtnAddChannel'>${ll("Add Channel")}</button>`)).querySelector("#editBtnAddChannel").addEventListener("click",()=>{try{blxEditedParamGet(0),blx.IparamAddChannel(blxDevice.iparam,!0),blxParametersCopy(!1,0);var e=document.getElementById("blxParameterEdit");e.innerHTML=blxParametersGetHtml(0),e.scrollTop=e.scrollHeight,JD.joPing()}catch(e){JD.joPingError(),blxCmdRes&&(blxCmdRes.textContent=e+" [BaC]")}}),document.getElementById("blxParameterEdit").innerHTML=blxParametersGetHtml(e),await JD.doCustomDialog(0)}function blxParCancel(e){e?blxDevice.sys_param=original_par:blxDevice.iparam=original_par,blxCmdRes&&(blxCmdRes.textContent=ll("Edit Parameters cancelled"))}function blxEditedParamGet(n){var e=(n?blxDevice.sys_param:blxDevice.iparam).length;for(let t=0;t<e;t++){var l=document.getElementById("__pidx"+t);let e=l.value.toString();!1===l.disabled&&(e="@"===e.charAt(0)?"?"+e.substr(1):e).replace("#","?"),n?blxDevice.sys_param[t]=e:blxDevice.iparam[t]=e}}async function blxParSend(e){let t;if(JD.spinnerShow(ll("Send Parameters"),null,120,!0),e)try{blxEditedParamGet(1),blxParametersCopy(!1,1);var n=blx.SysParamValidate(blxDevice.sys_param);if(n)throw"ERROR: SysParam-Check(3):\n"+n;var l=(new TextEncoder).encode(blxDevice.sys_param.join("\n")+"\n"),a=blx.getCrc32(l);await blStore.get(blxDevice.deviceMAC+"_sys_param.lxp");let e=blStore.result();if(void 0!==e&&a===e.v.crc32&&l.length===e.v.akt_len&&!1===blxDevice.sys_param_dirtyflag)return blxCmdRes&&(blxCmdRes.textContent=ll("No Changes")),JD.spinnerClose(),t;void 0===e&&(e={v:{}}),blxDevice.sys_param_dirtyflag=!0;var i=new TextEncoder;if(e.v.bytebuf=i.encode(blxDevice.sys_param.join("\n")+"\n"),e.v.crc32=blx.getCrc32(e.v.bytebuf),e.v.total_len=e.v.bytebuf.length,e.v.akt_len=e.v.total_len,e.v.ctime=new Date(1e3*blxDevice.sys_param[4]),e.v.esync_flag=!0,e.v.tssync=void 0,await blStore.set(blxDevice.deviceMAC+"_sys_param.lxp",e.v),await _blxCmdSend(".fput "+blxDevice.deviceMAC+"_sys_param.lxp"),_blxCmdResult)throw _blxCmdResult;if(await _blxCmdSend("Y"),_blxCmdResult)throw _blxCmdResult;blxDevice.sys_param_dirtyflag=!1,await blStore.set(blxDevice.deviceMAC+"_#BAK_sys_param.lxp",e.v)}catch(e){JD.joPingError(),blxCmdRes&&(blxCmdRes.textContent=e+"[BPb]"),await doDialogOK(ll("ERROR"),ll("Parameter")+` Check 'sys_param'</b><br><br><br>${e}<br>`,null),t=e}else try{blxEditedParamGet(0),blx.CompactIparam(blxDevice.iparam),blxParametersCopy(!1,0);var o=blx.IparamValidate(blxDevice.iparam);if(o)throw"ERROR: Iparam-Check(3):\n"+o;var r=(new TextEncoder).encode(blxDevice.iparam.join("\n")+"\n"),s=blx.getCrc32(r);await blStore.get(blxDevice.deviceMAC+"_iparam.lxp");let e=blStore.result();if(void 0!==e&&s===e.v.crc32&&r.length===e.v.akt_len&&!1===blxDevice.iparam_dirtyflag)return blxCmdRes&&(blxCmdRes.textContent=ll("No Changes")),JD.spinnerClose(),t;void 0===e&&(e={v:{}}),blxEditedParamGet(0),blxDevice.iparam[4]=(Date.now()/1e3).toFixed(0),blxDevice.iparam_dirtyflag=!0;var d=new TextEncoder;if(e.v.bytebuf=d.encode(blxDevice.iparam.join("\n")+"\n"),e.v.crc32=blx.getCrc32(e.v.bytebuf),e.v.total_len=e.v.bytebuf.length,e.v.akt_len=e.v.total_len,e.v.ctime=new Date(1e3*blxDevice.iparam[4]),e.v.esync_flag=!0,e.v.tssync=void 0,await blStore.set(blxDevice.deviceMAC+"_iparam.lxp",e.v),await _blxCmdSend(".fput "+blxDevice.deviceMAC+"_iparam.lxp"),_blxCmdResult)throw _blxCmdResult;if(await _blxCmdSend("X"),_blxCmdResult)throw _blxCmdResult;blxDevice.iparam_dirtyflag=!1,await blStore.set(blxDevice.deviceMAC+"_#BAK_iparam.lxp",e.v)}catch(e){JD.joPingError(),blxCmdRes&&(blxCmdRes.textContent=e+"[BPa]"),await doDialogOK(ll("ERROR"),ll("Parameter Check")+` 'iparam'</b><br><br><br>${e}<br>`,null),t=e}return await updateDeviceList(),JD.spinnerClose(),t}function blxParametersCopy(e,t){var n=t?blxDevice.sys_param:blxDevice.iparam;if(!0===e)if(original_par=[],void 0===n)doDialogOK(ll("ERROR")+": Iparam-Check(1)","No Parameters found!",null);else{for(let e=0;e<n.length;e++)original_par[e]=n[e];blx.IparamValidate(blxDevice.iparam)&&doDialogOK(ll("ERROR")+": Iparam-Check(2)","cres",null)}}function blxParametersGetHtml(e){var l=e?blxDevice.sys_param:blxDevice.iparam;let a,i=0,o="";var r="???";for(let n=0;n<l.length;n++){"@"===(r=l[n]).charAt(0)?(100===(d=parseInt(r.substring(1)))?(a=p100_beschr)[0]="*=== System ===":200===d?(a=p200_beschr)[0]="*=== Sys_Param ===":(a=pkan_beschr)[0]="*=== Channel #"+d+" ===",i=0,o+="<hr>"):i++;var s,d=void 0!==a[i]?a[i]:"(unknown)";let e,t=(d.indexOf("Timestamp.32")&&1e9<parseInt(r)&&(s=new Date(1e3*r),e=s.toUTCString()),`<span class='jo-font-small'>[${n}+(+${i})]</span>
            <input type='text' id='__pidx${n}' value='${r}'`);"*"===d.charAt(0)&&(t+=" disabled"),t+=">",e&&(t+=` ${e} `),t+=` <span class='jo-font-small'>'${a[i]}'</span><br>`,o+=t}return o}async function blxEditIparam(){for(blxParametersCopy(!0,0);;){if("OK"!==await editParamDialogDo(0)){blxParCancel(0);break}if(!await blxParSend(0))break}}async function blxEditSysparam(){for(blxParametersCopy(!0,1);;){if("OK"!==await editParamDialogDo(1)){blxParCancel(1);break}if(!await blxParSend(1))break}}function bleCallback(l,a,i){switch(l){case"CON":switch(connectionLevel=a,console.log("CON-Level: "+a),a){case 0:case 1:blxConnectButtonText&&(blxConnectButtonText.textContent=ll("Connect")),blxInfoLine&&(blxInfoLine.textContent=ll("Disconnect")),blxMemory&&(blxMemory.textContent="-"),blxSync&&(blxSync.textContent="-"),blxSignal&&(blxSignal.hidden=!0),blxMeasureData&&(blxMeasureData.innerHTML="-"),sidebuttonBluetooth.querySelector("i").classList.remove("jo-icon-ani-beat"),disabler(!1);break;case 2:lastAdvertisingName=blx.getDevice().advertisingName,blxDeviceName&&(blxDeviceName.textContent=lastAdvertisingName),blxMAC&&(blxMAC.textContent="-"),blxType&&(blxType.textContent="-"),blxFW&&(blxFW.textContent="-"),sidebuttonBluetooth.querySelector("i").classList.add("jo-icon-ani-beat"),blxSignal&&(blxSignal.textContent="... dBm"),blxSignal&&(blxSignal.style.backgroundColor="gray");var o=`${ll("Connecting")} '${lastAdvertisingName}'...`;blxConnectButtonText&&(blxConnectButtonText.textContent=o),blxInfoLine&&(blxInfoLine.textContent=o),blxGraph&&(blxGraph.innerHTML=""),JD.spinnerGetBusy()||JD.spinnerShow("Bluetooth",o,30,!0);break;case 3:JD.spinnerGetBusy()&&JD.spinnerSetInfo(ll("Reading IDs...")),blxInfoLine&&(blxInfoLine.textContent=ll("Reading IDs...")),blxConnectButtonText&&(blxConnectButtonText.textContent=`'${lastAdvertisingName}'`);break;case 4:blxSignal&&(blxSignal.hidden=!1),disabler(!1)}break;case"UPLOAD":uplStatus={totalsize:a,mode:i,sumsize:0,filesize:0,filename:"",fproc:0,ndata:!0};break;case"GET":uplStatus.filesize=a,uplStatus.filename=i,uplStatus.ndata=!0,blxInfoLine&&(blxInfoLine.textContent=ll("File")+`:'${i}' ${a} Byte`);break;case"PROG":uplStatus.fproc=a,uplStatus.ndata=!0;let e,t;t=uplStatus.totalsize?(r=uplStatus.sumsize/uplStatus.totalsize*100,d=uplStatus.filesize/uplStatus.totalsize*uplStatus.fproc,`${e=(r+d).toFixed(0)}% of ${(uplStatus.totalsize/1024).toFixed(0)} kB`):(e=a)+"%",JD.spinnerGetBusy()&&(JD.spinnerSetProgress(e),JD.spinnerSetInfo(t)),blxInfoLine&&(blxInfoLine.textContent=e+"%");break;case"GET_OK":uplStatus.sumsize+=a,uplStatus.ndata=!0,blxInfoLine&&(blxInfoLine.textContent=`OK (${a} ${i} )`);break;case"RSSI":var r=.273*a+28;let n="limegreen";0<=r&&(r<4?n="gray":r<8&&(n="orange")),blxSignal&&(blxSignal.textContent=a+" dBm"),blxSignal&&(blxSignal.style.backgroundColor=n),l=void 0;break;case"VSENS":blxInfoLine&&(blxInfoLine.textContent="VSENS "+i+": "+a),l=void 0;break;case"INFO":blxInfoLine&&(blxInfoLine.textContent=i);break;case"MSG":blxInfoLine&&(blxInfoLine.textContent="MSG "+a+":"+i);break;case"WARN":blxCmdRes&&(blxCmdRes.textContent="WARNING "+a+":"+i);break;case"ERR":blxCmdRes&&(blxCmdRes.textContent="ERROR "+a+":"+i);break;case"BZY":var s=parseInt(i);if(blxInfoLine)switch(a){case 1:blxInfoLine.textContent=2<s?`${ll("Info")}: ${ll("Measure")} (max. ${s} ${ll("sec")})`:ll("Info")+": "+ll("Measure");break;case 9:blxInfoLine.textContent=`${ll("Info")}: ${ll("Internet in")} ${s}  `+ll("sec");break;case 10:blxInfoLine.textContent=`${ll("Info")}: ${ll("Internet Transfer")}...`;break;case 11:blxInfoLine.textContent=s?`${ll("ERROR")}: ${ll("Internet Transfer")}: `+s:`${ll("Info")}: ${ll("Internet Transfer")}: OK`}break;case"MEAS_CH":measureData=0<a?`
${ll("Channels")}: `+a:`
${ll("Measure")}...`;break;case"MEAS_T":0<a&&(d=a/1e3,r=`(${ll("Wait Max:")} ${d} " ${ll("sec")})`,measureData+=" "+r,JD.spinnerGetBusy())&&(JD.spinnerSetInfo(r),JD.spinnerSetTime(1+d)),blxMeasureData&&(blxMeasureData.innerHTML=measureData+"<br>...");break;case"MEAS_V":if("*"==i[0]&&(i=`(${ll("ALARM")}) `+i.substring(1)),90==a&&void 0!==blxDevice.sys_param&&void 0!==blxDevice.sys_param[16]){var r=parseFloat(blxDevice.sys_param[15]),d=parseFloat(blxDevice.sys_param[16]);if(r<d){let e=((parseFloat(i)-r)/(d-r)*100).toFixed(2);i+="("+(e=100<e?100:e)+"%)"}}else 93==a&&void 0!==blxDevice.sys_param&&void 0!==blxDevice.sys_param[14]&&(d=parseFloat(blxDevice.sys_param[14]),!isNaN(d))&&0<d&&(i+="("+(100*parseFloat(i)/d).toFixed(2)+"%)");measureData+="<br>("+a+") "+i,blxMeasureData&&(blxMeasureData.innerHTML=measureData)}void 0!==l&&console.log("BLX: ",l,a,i)}async function getSetupOptions(){await blStore.get("#blxDash_#SETUP");var e=blStore.result();void 0!==e&&((setupOptions=e.v).dtheme&&JD.dashToggleTheme(),setupOptions.font&&JD.dashSetFont(setupOptions.font/100),setupOptions.lang)&&I18.i18localize(setupOptions.lang)}async function doSetupDialog(){var e=await blStore.quotaget(),e=`<div>
        <div>    
        <i class="bi-info-circle"></i>    
        ${ll("Contact/Info")}: <a href="https://joembedded.de">(C)JoEmbedded.de</a>
        </div>
        <br>

        ${ll("Storage: Used Memory")}: ${e.usedMB} MB (${e.usedPerc} %)<br>
        <label for="jd-lang">${ll("Language")}</label>:
        <select id="jd-lang">
            <!-- dynamically filled -->
        </select>
        <br>
        <br>
        <label for="jd-fontsize">${ll("Fontsize")}</label>:
        <select id="jd-fontsize">
            <option>50%</option>
            <option>75%</option>
            <option>100%</option>
            <option>125%</option>
            <option>133%</option>
            <option>150%</option>
            <option>175%</option>
            <option>200%</option>
        </select>
        <br>
        <br>
        <label for="jd-theme">${ll("Theme Dark/White")}:</label> <input type="checkbox" id="jd-theme">
        <br>
        <br>
        <label for="jd-server">${ll("Remote Server")}</label>:<br>
        <div style="display: flex; align-items: center; ">
            <i class="bi-globe"></i>
            <input autocapitalize='none' style="flex-grow: 1; margin: 0 5px;" type="text" id="jd-server">
            <button id="jd-servertest"><i class="bi-globe "></i> ...</button>
        </div>
        <br>
        <label  for="jd-accesstoken">${ll("Access-Token")}</label>:<br>
        <div style="display: flex; align-items: center;">
            <i class="bi-database-lock"></i>
            <input autocapitalize='none' type="text" style="margin: 0 5px;" id="jd-accesstoken" size="20">
        </div>
    </div>`;let n=JD.prepareCustomDialog("Dashboard Setup",e,null);n.querySelector("#jd-theme").checked=setupOptions.dtheme,n.querySelector("#jd-fontsize").value=setupOptions.font+"%";e=n.querySelector("#jd-lang");let t="";I18.i18_availLang.forEach(e=>{t+=`<option>${e}</option>`}),e.innerHTML=t,n.querySelector("#jd-lang").value=setupOptions.lang,n.querySelector("#jd-server").value=setupOptions.server,n.querySelector("#jd-accesstoken").value=setupOptions.accesstoken,e.addEventListener("change",e=>{var t=n.querySelector("#jd-lang").value;setupOptions.lang=t,I18.i18localize(t)}),n.querySelector("#jd-fontsize").addEventListener("change",e=>{var t=n.querySelector("#jd-fontsize").value;setupOptions.font=parseInt(t),JD.dashSetFont(setupOptions.font/100)}),n.querySelector("#jd-theme").addEventListener("click",e=>{JD.dashToggleTheme(),setupOptions.dtheme=!setupOptions.dtheme}),n.querySelector("#jd-servertest").addEventListener("click",e=>{isUrlGit?JD.doDialogOK(ll("ERROR"),`${ll("Can't Open Server on GITs")}<br>(Host: '${location.hostname}')`):window.open(n.querySelector("#jd-server").value+"?k="+n.querySelector("#jd-accesstoken").value)}),"OK"===await JD.doCustomDialog()&&(setupOptions.server=n.querySelector("#jd-server").value,setupOptions.accesstoken=n.querySelector("#jd-accesstoken").value),await blStore.set("#blxDash_#SETUP",setupOptions)}async function runServerSync(){if(blx.terminalPrint(ll("Server-Synchronize")+"..."),isUrlGit)JD.doDialogOK(ll("ERROR"),`${ll("Can't Open Server on GITs")}<br>(Host: '${location.hostname}')`);else{disabler(!0),JD.spinnerShow(ll("Server-Synchronize"),null,300,!1);try{var n=setupOptions.server,l=setupOptions.accesstoken;for(let t=0;t<deviceListDB.length;t++){var a=deviceListDB[t],i=a.files;if(void 0!==i&&0<i.length)for(let e=0;e<i.length;e++)if(i[e].nowsyncflag){var o=`SendFile Device/MAC: '${a.advname}'/${a.mac}, File: '${i[e].fname}'`,r=(blx.terminalPrint(o),JD.spinnerSetInfo(o),JD.spinnerSetProgress(t/deviceListDB.length*100),a.mac+"_"+i[e].fname),s=(await blStore.get(r),blStore.result());if(void 0!==s){var d=s.v,c=await SendTextFile2Server(n,"upsync",l,a.mac,i[e].fname,d);if("object"!=typeof c||"OK"!=c.status){let e=c;throw e="object"==typeof c?c.status:e}d.tssync=c.tssync,await blStore.set(r,d),JD.joPing()}}}blx.terminalPrint(ll("Server-Synchronize")+": OK")}catch(e){JD.joPingError(),JD.doDialogOK(ll("ERROR"),ll("Server-Synchronize")+`: '${e}'`),blx.terminalPrint(ll("Server-Synchronize")+`: '${e}'`)}await updateDeviceList(),JD.spinnerClose(),disabler(!1)}}async function SendTextFile2Server(e,t,n,l,a,i){try{var o=new Uint8Array(i.bytebuf),r={mac:l,filename:a,data:(new TextDecoder).decode(o)},s=await fetch(e+"?k="+n+"&cmd="+t,{method:"POST",mode:"cors",headers:{"Content-Type":"application/json"},body:JSON.stringify(r)});if(200!==s.status)throw"'"+s.status+": "+s.statusText+"'";{let t;try{t=await s.json()}catch(e){t={status:`ERROR: Server replies '${e}'`}}return t.tssync=Date.now(),t}}catch(e){return console.log("ERROR:",e),"ERROR: "+e}}async function deviceDialogDo(e){let t=deviceListDB[e];e=JD.prepareCustomDialog(ll("Device Info"),"<div id='deviceDialog-content' class='jo-dialog-big'>",null,`&nbsp;&nbsp;<button id='removeDeviceBtn'><i class = 'bi-trash3'></i> ${ll("Remove")}</button>`);e.querySelector("#removeDeviceBtn").addEventListener("click",async()=>{await JD.doDialogOK(ll("Remove Device?"),`<b>${ll("Name")}: '${t.advname}'</b><br>MAC: ${t.mac}<br>`,"<i class='bi-trash3'></i> "+ll("Remove"),!0)&&(await removeDevice(t.mac),JD.closeCustomDialog("REMOVED"))});let n=`<b>${ll("Name")}: '${t.advname}'</b><br>MAC: ${t.mac}<br>`;n=n+("<br>PIN: "+(0<t.pin?t.pin:"-"))+"<br><br>";var l=t.files.length;if(l){n+=`<table style="text-align: left;"><tr><th>${ll("File")}</th><th>Byte</th><th>&orarr;</th><th>${ll("Age")}</th></tr>`;for(let e=0;e<l;e++){var a,i,o,r=t.files[e];r.nowsyncflag?n+='<tr style="background-color:chocolate;")>':n+="<tr>","xtract.edt"==r.fname?(a="<a target='_blank' href='../gdraw/gdraw.html?st="+t.mac+"_xtract.edt&sn="+t.advname+"'> Show Graph </a>",n+=`<td>${a}</td>`):n+=`<td>'${r.fname}'</td>`,n=(n+=`<td>${r.aktlen}</td>`)+`<td> ${r.syncflag?"&#10004;":"-"}</td><td>`,void 0!==r.tssync?(a=(Date.now()-r.tssync)/1e3,a=(a=(a-=86400*(r=Math.floor(a/86400)))-3600*(i=Math.floor(a/3600)))-60*(o=Math.floor(a/60)),n+=`${r}d ${i}h ${o}min ${Math.floor(a)}sec`):n+="-",n+="</td></tr>"}n+="</table>"}else n+=ll("No Files!");e.querySelector("#deviceDialog-content").innerHTML=n,await JD.doCustomDialog()}async function updateDeviceList(){deviceListDB=[];let i=0,o=0,r=0,n=(navDevicelist.innerHTML="",await blStore.iterate(function(l){var t=l.k.substr(0,16);if(16===t.length&&"_"===l.k.charAt(16)){let n;for(let e=0;e<deviceListDB.length;e++)if(deviceListDB[e].mac===t){n=e;break}void 0===n&&(a="MAC:..."+t.slice(-8),n=deviceListDB.length,deviceListDB.push({mac:t,files:[],synccnt:0,advname:a,pin:0}));var a=l.k.substr(17);if(l.k===t+"_#BlxIDs")deviceListDB[n].advname=l.v.advertisingName;else if(l.k===t+"_#PIN")deviceListDB[n].pin=l.v;else if("#"!==l.k.charAt(17)){void 0!==l.v.akt_len&&(i+=l.v.akt_len);let e=!1,t=!1;switch(a){case"data.edt":case"data.edt.old":case"iparam.lxp":case"sys_param.lxp":e=!0,void 0===l.v.tssync&&(t=!0)}deviceListDB[n].files.push({fname:a,aktlen:l.v.akt_len,syncflag:e,nowsyncflag:t,tssync:l.v.tssync}),e&&o++,t&&(deviceListDB[n].synccnt++,r++)}}}),deviceListDB.sort(function(e,t){return e.advname.localeCompare(t.advname)}),"");for(let t=0;t<deviceListDB.length;t++){var l=deviceListDB[t],a=l.files;let e;a.length?(e=`<div id="butDevDetails${t}" class="jo-sibu jo-badge-smallcircle">
            <i class="bi-file-earmark-bar-graph"></i>
            <span>'${l.advname}'</span>`,l.synccnt?e+=`<span class="jo-badge-span">&utrif;${l.synccnt}/${a.length}</span></div>`:e+=`<span class="jo-badge.span jo-badge-unimportant">${a.length}</span></div>`):e=`<div id="butDevDetails${t}" class="jo-sibu">
            <i class="bi-file-earmark-text" style="color: var(--midgray50)"></i>
            <span>'${l.advname}'</span>
            </div>`,n+=e}navDevicelist.innerHTML=n;for(let e=0;e<deviceListDB.length;e++)document.getElementById("butDevDetails"+e).addEventListener("click",()=>deviceDialogDo(e));var e=sidebuttonServersync.querySelector("i").classList,t=sidebuttonServersync.querySelector(".jo-badge-span");r?(e.add("jo-icon-ani-shake"),t.classList.remove("jo-hidden"),t.innerHTML=`&utrif;${r}/`+o):(e.remove("jo-icon-ani-shake"),t.classList.add("jo-hidden"))}async function removeDevice(t){if(16!=t.length)return!1;let n=[];if(await blStore.iterate(function(e){e.k.substr(0,16)===t&&"_"===e.k.charAt(16)&&n.push(e.k)}),!n.length)return!1;for(let e=0;e<n.length;e++)await blStore.remove(n[e]);await updateDeviceList()}function ownertoken2pin(e){return parseInt(e.substring(0,8),16)%899800+100100}async function addDevice(e,t,n){if(16!=e.length)return!1;let l;if(void 0!==t&&void 0===n){if(16!=t.length)return!1;l=ownertoken2pin(t)}else{if(void 0!==t||void 0===n)return!1;if(6!=n.length)return!1;l=n}return await blStore.set(e+"_#PIN",l.toString()),await updateDeviceList(),!0}let qrlink=void 0,searchmac="";async function scanFoundAddDevice(n){if(n.toLowerCase().startsWith("http"))return void 0!==qrlink?void 0:(qrlink=n,blx.terminalPrint(`Scanned: '${qrlink}'`),!0===await JD.doDialogOK("Open Link?",`'${qrlink}''`,void 0,!0,10)&&(QRS.torchOff(),window.open(qrlink)),qrlink=void 0,1);var l=n.split(" ");if(2==l.length&&l[0].startsWith("MAC:")){let n=l[0].substring(4);if(16==n.length){var a=deviceListDB.find(e=>e.mac==n);if(void 0===a||0==a.pin){let e=!1,t;if(blx.chordsound(750,.2,.2),l[1].startsWith("OT:")?16==(a=l[1].substring(3)).length&&(t=ownertoken2pin(a),e=await addDevice(n,a,void 0)):l[1].startsWith("PIN:")&&6==(t=l[1].substring(4)).length&&(e=await addDevice(n,void 0,t)),!0===e&&n==searchmac)return blxPIN.value=t,await JD.dashSleepMs(500),blxSetPin(),0}else blx.frq_ping(750,.1,.3);return 1}}if(n.startsWith("TXT-")&&":"==n[6]){let e=n.substring(4,6),t=n.substring(7);return blx.terminalPrint(`Text(${e}): '${t}'`),blx.frq_ping(1500,.1,.3),setTimeout(()=>JD.sagmal(t,e.toLowerCase()),300),2}return blx.frq_ping(30,.1,.3),-1}async function bdRunQRscanner(e=""){searchmac=e,QRS.setQrLogPrint(blx.terminalPrint),QRS.setScanCallback(scanFoundAddDevice),QRS.clearScannedResults();e=await QRS.openSelectedCamera();"string"==typeof e?JD.doDialogOK(ll("ERROR"),ll("Reason")+`: '${e}'`,null):await QRS.scannerBusy()}function checkViewportEnablers(){JD.isFullInViewportHeight(sectionMain)?!1!==sectionMainEnabled&&(sectionMainEnabled=!1,sidebuttonMaincontent.classList.add("jo-disabled")):!0!==sectionMainEnabled&&(sectionMainEnabled=!0,sidebuttonMaincontent.classList.remove("jo-disabled")),JD.isFullInViewportHeight(sectionTerminal)?!1!==sectionTerminalEnabled&&(sectionTerminalEnabled=!1,sidebuttonTerminal.classList.add("jo-disabled")):!0!==sectionTerminalEnabled&&(sectionTerminalEnabled=!0,sidebuttonTerminal.classList.remove("jo-disabled"));var e=navigator.onLine;lastOnlineState!==e&&(bdOnline.hidden=!e,bdOffline.hidden=e,(lastOnlineState=e)?sidebuttonServersync.classList.remove("jo-disabled"):sidebuttonServersync.classList.add("jo-disabled"))}function blxtimer1sec(){checkViewportEnablers()}if(window.jdDebug){document.addEventListener("wheel",e=>{var t=getComputedStyle(document.documentElement).getPropertyValue("--fontrel"),e=0<e.deltaY?.8:1.2,t=parseFloat(t)*e;JD.dashSetFont(t)});let e=document.getElementById("button-debug"),t=(e.hidden=!1,0);e.addEventListener("click",async()=>{t++,I18.notFound()})}console.log("blxdash.js init, Version:",VERSION);export{VERSION,COPYRIGHT};