namespace Jarvice.CommandProcessor.Interfaces;

public interface IFileWorkerService
{
	void OpenOrFocusFile(string path);
	void CloseFile(string path);
}
