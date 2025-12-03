using Jarvice.CommandProcessor.Interfaces;
using Jarvice.SpeechService.Enums;
using Jarvice.SpeechService.Interfaces;
using System.Diagnostics;
using System.Management;
using System.Runtime.InteropServices;

namespace Jarvice.CommandProcessor.Services;
public class FileWorkerService : IFileWorkerService
{
	[DllImport("user32.dll")]
	private static extern bool SetForegroundWindow(IntPtr hWnd);

	[DllImport("user32.dll")]
	private static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
	private const int SW_RESTORE = 3;

	private readonly ISpeechService _speechService;
	private readonly Dictionary<int, string> _vsProcesses = new(); 

	public FileWorkerService(ISpeechService speechService)
	{
		_speechService = speechService;
		RefreshVSProcesses();
	}

	public void OpenOrFocusFile(string path)
	{
		if (string.IsNullOrWhiteSpace(path) || !File.Exists(path))
		{
			Console.WriteLine($"❌ File not found: {path}");
			return;
		}

		path = Path.GetFullPath(path).ToLowerInvariant();

		// Check cached VS processes first
		foreach (var pid in _vsProcesses.Keys.ToList())
		{
			try
			{
				if (_vsProcesses[pid].Contains(path))
				{
					var process = Process.GetProcessById(pid);
					_speechService.Speak(VoiceResponse.HereItIsItWasAlreadyOpened);
					if (process.MainWindowHandle != IntPtr.Zero)
					{
						ShowWindow(process.MainWindowHandle, SW_RESTORE);
						SetForegroundWindow(process.MainWindowHandle);
					}
					return;
				}
			}
			catch
			{
				// Process may have exited, refresh cache
				RefreshVSProcesses();
			}
		}

		// Not found, open new
		try
		{
			Process.Start(new ProcessStartInfo
			{
				FileName = path,
				UseShellExecute = true
			});
			_speechService.Speak(VoiceResponse.ProcessStartedSolutionIsOpening);

			// Refresh cache to include the newly opened VS
			RefreshVSProcesses();
		}
		catch (Exception ex)
		{
			Console.WriteLine($"⚠️ Failed to open file: {ex.Message}");
		}
	}

	public void CloseFile(string path)
	{
		if (string.IsNullOrWhiteSpace(path))
		{
			Console.WriteLine("❌ Invalid path.");
			return;
		}

		path = Path.GetFullPath(path).ToLowerInvariant();

		foreach (var (pid, cmdLine) in _vsProcesses)
		{
			if (cmdLine.Contains(path))
			{
				try
				{
					var process = Process.GetProcessById(pid);
					if (!process.HasExited)
					{
						_speechService.Speak(VoiceResponse.CloseService);
						process.CloseMainWindow();
						if (!process.WaitForExit(2000)) 
						{
							Console.WriteLine("⚠️ Graceful close failed, killing process...");
							process.Kill();
						}

						RefreshVSProcesses();
						return;
					}
				}
				catch (Exception ex)
				{
					Console.WriteLine($"⚠️ Error closing process: {ex.Message}");
				}
			}
		}

		RefreshVSProcesses();
		Console.WriteLine($"❌ No matching Visual Studio instance found for: {path}");
	}

	private void RefreshVSProcesses()
	{
		_vsProcesses.Clear();
		foreach (var process in Process.GetProcessesByName("devenv"))
		{
			try
			{
				var cmdLine = GetCommandLine(process);
				if (!string.IsNullOrEmpty(cmdLine))
					_vsProcesses[process.Id] = cmdLine.ToLowerInvariant();
			}
			catch { /* ignore inaccessible processes */ }
		}
	}

	private static string? GetCommandLine(Process process)
	{
		try
		{
			using var searcher = new ManagementObjectSearcher(
				$"SELECT CommandLine FROM Win32_Process WHERE ProcessId = {process.Id}");
			using var objects = searcher.Get();
			var mo = objects.Cast<ManagementBaseObject>().FirstOrDefault();
			return mo?["CommandLine"]?.ToString();
		}
		catch
		{
			return null;
		}
	}
}
