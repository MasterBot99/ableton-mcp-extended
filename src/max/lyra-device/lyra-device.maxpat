{
	"patcher" : 	{
		"fileversion" : 1,
		"appversion" : 		{
			"major" : 8,
			"minor" : 6,
			"revision" : 5,
			"architecture" : "x64",
			"modernui" : 1
		}
,
		"classnamespace" : "box",
		"rect" : [ -181.0, -988.0, 910.0, 954.0 ],
		"bglocked" : 0,
		"openinpresentation" : 1,
		"default_fontsize" : 12.0,
		"default_fontface" : 0,
		"default_fontname" : "Arial",
		"gridonopen" : 1,
		"gridsize" : [ 15.0, 15.0 ],
		"gridsnaponopen" : 1,
		"objectsnaponopen" : 1,
		"statusbarvisible" : 2,
		"toolbarvisible" : 1,
		"lefttoolbarpinned" : 0,
		"toptoolbarpinned" : 0,
		"righttoolbarpinned" : 0,
		"bottomtoolbarpinned" : 0,
		"toolbars_unpinned_last_save" : 0,
		"tallnewobj" : 0,
		"boxanimatetime" : 200,
		"enablehscroll" : 1,
		"enablevscroll" : 1,
		"devicewidth" : 640.0,
		"description" : "Lyra — Bridge status, suggestions, and memory strip for Ableton Live",
		"digest" : "Lyra Max for Live presence layer",
		"tags" : "lyra, ableton, mcp, bridge",
		"style" : "",
		"subpatcher_template" : "",
		"assistshowspatchername" : 0,
		"boxes" : [ 			{
				"box" : 				{
					"fontface" : 1,
					"fontname" : "Arial",
					"fontsize" : 14.0,
					"id" : "obj-title",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 20.0, 15.0, 420.0, 22.0 ],
					"text" : "Lyra — Bridge Client (node.script)"
				}

			}
, 			{
				"box" : 				{
					"fontname" : "Arial",
					"fontsize" : 11.0,
					"id" : "obj-hint",
					"linecount" : 2,
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 20.0, 40.0, 396.0, 31.0 ],
					"text" : "Bridge: ws://127.0.0.1:3351/ws — start with: npm start in ableton-mcp-extended\nToggle ON = connect, OFF = disconnect. Tool test message optional."
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-ns",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "" ],
					"patching_rect" : [ 40.0, 220.0, 360.0, 22.0 ],
					"saved_object_attributes" : 					{
						"autostart" : 1,
						"defer" : 0,
						"node_bin_path" : "",
						"npm_bin_path" : "",
						"watch" : 1
					}
,
					"text" : "node.script /Users/andi/ableton-mcp-extended/src/max/lyra-device/bridge-client.js @autostart 1 @watch 1",
					"varname" : "lyra_bridge"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-route",
					"maxclass" : "newobj",
					"numinlets" : 7,
					"numoutlets" : 7,
					"outlettype" : [ "", "", "", "", "", "", "" ],
					"patching_rect" : [ 40.0, 260.0, 360.0, 22.0 ],
					"text" : "route status suggestion memory result error message",
					"varname" : "lyra_route"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-toggle",
					"maxclass" : "toggle",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "int" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 40.0, 100.0, 24.0, 24.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 560.0, 360.0, 28.0, 28.0 ],
					"varname" : "connect_toggle"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-sel",
					"maxclass" : "newobj",
					"numinlets" : 3,
					"numoutlets" : 3,
					"outlettype" : [ "bang", "bang", "" ],
					"patching_rect" : [ 40.0, 135.0, 50.0, 22.0 ],
					"text" : "sel 1 0"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-msg-connect",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 40.0, 170.0, 58.0, 22.0 ],
					"text" : "connect"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-msg-disconnect",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 110.0, 170.0, 72.0, 22.0 ],
					"text" : "disconnect"
				}

			}
, 			{
				"box" : 				{
					"fontname" : "Arial",
					"fontsize" : 11.0,
					"id" : "obj-lbl-connect",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 70.0, 102.0, 120.0, 19.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 520.0, 340.0, 100.0, 19.0 ],
					"text" : "Connect"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-msg-tool",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 220.0, 170.0, 320.0, 22.0 ],
					"text" : "tool lyra.memory.read project default session default"
				}

			}
, 			{
				"box" : 				{
					"fontsize" : 11.0,
					"id" : "obj-lbl-tool",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 220.0, 150.0, 200.0, 19.0 ],
					"text" : "Test tool call (click message)"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-status-set",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 40.0, 310.0, 78.0, 22.0 ],
					"text" : "prepend set"
				}

			}
, 			{
				"box" : 				{
					"bgcolor" : [ 0.18, 0.18, 0.2, 1.0 ],
					"border" : 1.0,
					"bordercolor" : [ 0.3, 0.3, 0.32, 1.0 ],
					"fontface" : 0,
					"fontname" : "Arial",
					"fontsize" : 14.0,
					"id" : "obj-status-ui",
					"ignoreclick" : 1,
					"maxclass" : "textedit",
					"numinlets" : 1,
					"numoutlets" : 4,
					"outlettype" : [ "", "int", "", "" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 40.0, 340.0, 300.0, 36.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 10.0, 28.0, 620.0, 36.0 ],
					"readonly" : 1,
					"rounded" : 4.0,
					"text" : "connected",
					"textcolor" : [ 1.0, 1.0, 1.0, 1.0 ],
					"varname" : "status_display",
					"wordwrap" : 0
				}

			}
, 			{
				"box" : 				{
					"fontname" : "Arial",
					"fontsize" : 11.0,
					"id" : "obj-lbl-status",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 40.0, 380.0, 80.0, 19.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 10.0, 8.0, 80.0, 19.0 ],
					"text" : "Status",
					"textcolor" : [ 0.7, 0.7, 0.72, 1.0 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-sugg-set",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 360.0, 310.0, 78.0, 22.0 ],
					"text" : "prepend set"
				}

			}
, 			{
				"box" : 				{
					"bgcolor" : [ 0.08, 0.08, 0.1, 1.0 ],
					"border" : 1.0,
					"bordercolor" : [ 0.25, 0.25, 0.28, 1.0 ],
					"fontname" : "Arial",
					"fontsize" : 12.0,
					"id" : "obj-sugg-ui",
					"keymode" : 1,
					"maxclass" : "textedit",
					"numinlets" : 1,
					"numoutlets" : 4,
					"outlettype" : [ "", "int", "", "" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 360.0, 340.0, 320.0, 120.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 10.0, 90.0, 620.0, 220.0 ],
					"readonly" : 1,
					"rounded" : 4.0,
					"textcolor" : [ 0.85, 0.85, 0.88, 1.0 ],
					"varname" : "suggestion_display"
				}

			}
, 			{
				"box" : 				{
					"fontname" : "Arial",
					"fontsize" : 11.0,
					"id" : "obj-lbl-sugg",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 360.0, 465.0, 120.0, 19.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 10.0, 70.0, 140.0, 19.0 ],
					"text" : "Suggestion Deck",
					"textcolor" : [ 0.7, 0.7, 0.72, 1.0 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-mem-set",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 40.0, 420.0, 78.0, 22.0 ],
					"text" : "prepend set"
				}

			}
, 			{
				"box" : 				{
					"bgcolor" : [ 0.12, 0.16, 0.14, 1.0 ],
					"border" : 1.0,
					"bordercolor" : [ 0.25, 0.35, 0.28, 1.0 ],
					"fontname" : "Arial",
					"fontsize" : 11.0,
					"id" : "obj-mem-ui",
					"ignoreclick" : 1,
					"maxclass" : "textedit",
					"numinlets" : 1,
					"numoutlets" : 4,
					"outlettype" : [ "", "int", "", "" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 40.0, 450.0, 300.0, 40.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 10.0, 330.0, 480.0, 50.0 ],
					"readonly" : 1,
					"rounded" : 4.0,
					"textcolor" : [ 0.45, 0.9, 0.55, 1.0 ],
					"varname" : "memory_summary"
				}

			}
, 			{
				"box" : 				{
					"fontname" : "Arial",
					"fontsize" : 11.0,
					"id" : "obj-lbl-mem",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 40.0, 495.0, 100.0, 19.0 ],
					"presentation" : 1,
					"presentation_rect" : [ 10.0, 312.0, 100.0, 19.0 ],
					"text" : "Memory",
					"textcolor" : [ 0.7, 0.7, 0.72, 1.0 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-res-set",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 360.0, 490.0, 78.0, 22.0 ],
					"text" : "prepend set"
				}

			}
, 			{
				"box" : 				{
					"bgcolor" : [ 0.15, 0.15, 0.17, 1.0 ],
					"bordercolor" : [ 0.5, 0.5, 0.5, 1.0 ],
					"fontname" : "Arial",
					"fontsize" : 11.0,
					"id" : "obj-res-ui",
					"maxclass" : "textedit",
					"numinlets" : 1,
					"numoutlets" : 4,
					"outlettype" : [ "", "int", "", "" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 360.0, 520.0, 320.0, 50.0 ],
					"readonly" : 1,
					"textcolor" : [ 0.8, 0.8, 0.82, 1.0 ],
					"varname" : "result_display"
				}

			}
, 			{
				"box" : 				{
					"fontsize" : 11.0,
					"id" : "obj-lbl-res",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 360.0, 575.0, 81.0, 19.0 ],
					"text" : "Result (debug)"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-err-set",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 700.0, 310.0, 78.0, 22.0 ],
					"text" : "prepend set"
				}

			}
, 			{
				"box" : 				{
					"bgcolor" : [ 0.25, 0.1, 0.1, 1.0 ],
					"bordercolor" : [ 0.5, 0.5, 0.5, 1.0 ],
					"fontname" : "Arial",
					"fontsize" : 11.0,
					"id" : "obj-err-ui",
					"maxclass" : "textedit",
					"numinlets" : 1,
					"numoutlets" : 4,
					"outlettype" : [ "", "int", "", "" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 700.0, 340.0, 180.0, 60.0 ],
					"readonly" : 1,
					"textcolor" : [ 1.0, 0.6, 0.6, 1.0 ],
					"varname" : "error_display"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-print-msg",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 700.0, 420.0, 90.0, 22.0 ],
					"text" : "print lyra-msg"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-print-err",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 700.0, 450.0, 80.0, 22.0 ],
					"text" : "print lyra-err"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-script-start",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 420.0, 100.0, 72.0, 22.0 ],
					"text" : "script start"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-script-stop",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 500.0, 100.0, 68.0, 22.0 ],
					"text" : "script stop"
				}

			}
, 			{
				"box" : 				{
					"fontsize" : 11.0,
					"id" : "obj-lbl-script",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 420.0, 80.0, 160.0, 19.0 ],
					"text" : "Node process (if needed)"
				}

			}
 ],
		"lines" : [ 			{
				"patchline" : 				{
					"destination" : [ "obj-err-ui", 0 ],
					"source" : [ "obj-err-set", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-mem-ui", 0 ],
					"source" : [ "obj-mem-set", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-ns", 0 ],
					"source" : [ "obj-msg-connect", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-ns", 0 ],
					"source" : [ "obj-msg-disconnect", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-ns", 0 ],
					"source" : [ "obj-msg-tool", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-route", 0 ],
					"source" : [ "obj-ns", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-res-ui", 0 ],
					"source" : [ "obj-res-set", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-err-set", 0 ],
					"order" : 1,
					"source" : [ "obj-route", 4 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-mem-set", 0 ],
					"source" : [ "obj-route", 2 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-print-err", 0 ],
					"order" : 0,
					"source" : [ "obj-route", 4 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-print-msg", 0 ],
					"source" : [ "obj-route", 5 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-res-set", 0 ],
					"source" : [ "obj-route", 3 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-status-set", 0 ],
					"source" : [ "obj-route", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-sugg-set", 0 ],
					"source" : [ "obj-route", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-ns", 0 ],
					"source" : [ "obj-script-start", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-ns", 0 ],
					"source" : [ "obj-script-stop", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-msg-connect", 0 ],
					"source" : [ "obj-sel", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-msg-disconnect", 0 ],
					"source" : [ "obj-sel", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-status-ui", 0 ],
					"source" : [ "obj-status-set", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-sugg-ui", 0 ],
					"source" : [ "obj-sugg-set", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-sel", 0 ],
					"source" : [ "obj-toggle", 0 ]
				}

			}
 ],
		"dependency_cache" : [ 			{
				"name" : "bridge-client.js",
				"bootpath" : "/Users/andi/ableton-mcp-extended/src/max/lyra-device",
				"patcherrelativepath" : ".",
				"type" : "TEXT",
				"implicit" : 1
			}
 ],
		"autosave" : 0
	}

}
