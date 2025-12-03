using Jarvice.CommandProcessor.Interfaces;
using Jarvice.SpeechService.Enums;
using Jarvice.SpeechService.Interfaces;
using System.Diagnostics;

namespace Jarvice.CommandProcessor.Services;

public class DockerWorkerService : IDockerWorkerService
{
	private readonly ISpeechService _speechService;

	public DockerWorkerService(ISpeechService speechService)
	{
		_speechService = speechService;
	}

	// Метод для перезапуску сервісів (можеш доповнити по своїй логіці)
	public void RestartServices(string powerShellScriptPath)
	{
		// Тепер цей метод може викликати ReloadServicesAsync або робити щось інше
	}

	// Основний метод для оновлення Docker образів і запуску контейнерів
	public async Task ReloadServicesAsync(string powerShellScriptToPull, string powerShellScriptToStart)
	{
		Console.WriteLine("Logging in to Azure Container Registry...");
		await RunCommandAsync(
			@"C:\Program Files (x86)\Microsoft SDKs\Azure\CLI2\wbin\az.cmd",
			"acr login --name oasismetis"
		);

		// Pull
		powerShellScriptToPull = Path.GetFullPath(powerShellScriptToPull);
		if (!File.Exists(powerShellScriptToPull))
			throw new FileNotFoundException($"Pull script not found: {powerShellScriptToPull}");

		var pullDir = Path.GetDirectoryName(powerShellScriptToPull) ?? Environment.CurrentDirectory;
		Console.WriteLine("Pulling Docker images...");
		await RunCommandAsync(
			"powershell.exe",
			$"-NoProfile -ExecutionPolicy Bypass -Command \"& '{powerShellScriptToPull}'\"",
			pullDir
		);
		Console.WriteLine("All images pulled successfully!");

		// Start
		powerShellScriptToStart = Path.GetFullPath(powerShellScriptToStart);
		if (!File.Exists(powerShellScriptToStart))
			throw new FileNotFoundException($"Start script not found: {powerShellScriptToStart}");

		var startDir = Path.GetDirectoryName(powerShellScriptToStart) ?? Environment.CurrentDirectory;
		Console.WriteLine("Starting containers...");
		await RunCommandAsync(
			"powershell.exe",
			$"-NoProfile -ExecutionPolicy Bypass -Command \"& '{powerShellScriptToStart}'\"",
			startDir
		);
		Console.WriteLine("Containers started!");
	}

	// Універсальний метод для запуску команд
	private async Task RunCommandAsync(string fileName, string arguments, string? workingDirectory = null)
	{
		var tcs = new TaskCompletionSource<bool>();

		var process = new Process
		{
			StartInfo = new ProcessStartInfo
			{
				FileName = fileName,
				Arguments = arguments,
				RedirectStandardOutput = true,
				RedirectStandardError = true,
				UseShellExecute = false,
				CreateNoWindow = true,
				WorkingDirectory = workingDirectory ?? Environment.CurrentDirectory
			},
			EnableRaisingEvents = true
		};

		process.OutputDataReceived += (s, e) =>
		{
			if (!string.IsNullOrEmpty(e.Data))
				Console.WriteLine(e.Data);
		};

		process.ErrorDataReceived += (s, e) =>
		{
			if (!string.IsNullOrEmpty(e.Data))
				Console.Error.WriteLine(e.Data);
		};

		process.Exited += (s, e) =>
		{
			Console.WriteLine($"Process exited with code {process.ExitCode}");
			tcs.SetResult(true);
			process.Dispose();
		};

		process.Start();
		process.BeginOutputReadLine();
		process.BeginErrorReadLine();

		await tcs.Task;

		if (process.ExitCode != 0)
			throw new Exception($"Command '{fileName} {arguments}' exited with code {process.ExitCode}");
	}
}
